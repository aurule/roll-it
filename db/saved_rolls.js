const { oneLine } = require("common-tags")

class UserSavedRolls {
  constructor(guildId, userId, db_obj) {
    this.guildId = guildId
    this.userId = userId
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Create an in-progress saved roll
   *
   * This new record has no options and is automatically marked as incomplete.
   *
   * The convention for `command_name` is to use the command object's name attribute, prefixed with the name
   * of its parent command and a space, if present.
   *
   * @param  {str} name         Name for the saved roll
   * @param  {str} description  Description for the saved roll
   * @param  {str} command_name Command the saved roll will invoke
   * @return {Info}             Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If `name` already exists for this guild
   */
  partial(name, description, command_name) {
    const insert = this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO saved_rolls (
        guildFlake,
        userFlake,
        name,
        description,
        command,
        options,
        incomplete
      ) VALUES (
        @guildFlake,
        @userFlake,
        @name,
        @description,
        @command,
        JSONB('{}'),
        true
      )
    `)
    return insert.run({
      guildFlake: this.guildId,
      userFlake: this.userId,
      name,
      description,
      command: command_name,
    })
  }

  /**
   * Create a new saved roll record
   *
   * Due to the way the saved roll creation process works in production, this method is almost exclusively
   * used during testing.
   *
   * The convention for `command_name` is to use the command object's name attribute, prefixed with the name
   * of its parent command and a space, if present.
   *
   * @param  {str} options.name         Name for the saved roll
   * @param  {str} options.description  Description for the saved roll
   * @param  {str} options.command      Command the saved roll will invoke
   * @param  {obj} options.options      [description]
   * @param  {bool} options.incomplete  [description]
   * @param  {bool} options.invalid     [description]
   * @return {Info}             Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If `name` already exists for this guild
   */
  create({name, description, command, options, incomplete, invalid}) {
    const insert =  this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO saved_rolls (
        guildFlake,
        userFlake,
        name,
        description,
        command,
        options,
        incomplete,
        invalid
      ) VALUES (
        @guildFlake,
        @userFlake,
        @name,
        @description,
        @command,
        JSONB(@options),
        @incomplete,
        @invalid
      )
    `)
    return insert.run({
      guildFlake: this.guildId,
      userFlake: this.userId,
      name,
      description,
      command,
      options: JSON.stringify(options),
      incomplete: +!!incomplete,
      invalid: +!!invalid,
    })
  }

  /**
   * Get an array of all saved rolls for this user and guild
   *
   * Each object in the array represents a single saved rol.
   *
   * @return {[type]} [description]
   */
  all() {
    const select = this.db.prepare(oneLine`
      SELECT * FROM saved_rolls
      WHERE guildFlake = ? AND userFlake = ?
    `)
    return select.all(this.guildId, this.userId)
  }

  /**
   * Get all stored data about a saved roll
   *
   * This method accepts either a saved roll ID or a name. At least one must be provided. If both are given, it
   * will prefer the ID.
   *
   * The `options` are parsed into an object before being returned.
   *
   * For safety, the query is always scoped to the current guild and user.
   *
   * @example
   * ```js
   * saved_rolls.detail(3)
   * // returns {
   * //   id: 3,
   * //   name: "Test Roll",
   * //   description: "A roll for testing",
   * //   command: "roll",
   * //   options: {
   * //     pool: 1,
   * //     sides: 6,
   * //   },
   * //   incomplete: false,
   * //   invalid: false,
   * // }
   * ```
   *
   * @param  {int} id   ID of the saved roll to get
   * @param  {str} name Name of the saved roll to get
   * @return {obj}      Object with all the fields of the saved roll
   */
  detail(id, name) {
    let sql = oneLine`
      SELECT *, JSON_EXTRACT(options, '$') AS options
      FROM saved_rolls
      WHERE
    `

    if (id) {
      sql += " id = @id AND guildFlake = @guildFlake AND userFlake = @userFlake"
    } else if (name) {
      sql += " guildFlake = @guildFlake AND userFlake = @userFlake AND name = @name"
    }

    const select = this.db.prepare(sql)
    const raw_out = select.get({
      id,
      name,
      guildFlake: this.guildId,
      userFlake: this.userId,
    })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      options: JSON.parse(raw_out.options),
      incomplete: !!raw_out.incomplete,
      invalid: !!raw_out.invalid,
    }
  }

  /**
   * Update an existing saved roll
   *
   * This method will only update the values that are passed in as part of `data`. Because this method can
   * change the saved roll's `name`, the `id` field is required. For safety, the update query is still scoped
   * to the current guild and user.
   *
   * When updating the `name` to a value that already exists, this method will throw an error and roll back
   * any transaction it's in.
   *
   * You *must* supply at least one data attribute when calling this function. Otherwise, it will throw an
   * error.
   *
   * @warning This method does not check `data` for consistency! It's fully possible to change the command or
   * options into an invalid state without setting the `invalid` flag to match.
   *
   * @param  {int} id   ID of the saved roll to change
   * @param  {obj} data Object of new values to set. All omitted attributes will be left alone.
   * @return {Info}     Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If the new `name` already exists for this guild and user
   * @throws {SqliteError} If `data` is empty
   */
  update(id, data) {
    let sql = "UPDATE OR ROLLBACK saved_rolls SET "
    const fields = []
    const placeholders = []
    const values = {}

    for (const field in data) {
      switch(field) {
        case "options":
          fields.push("options")
          placeholders.push("JSONB(@options)")
          values.options = JSON.stringify(data.options)
          break;
        case "incomplete":
        case "invalid":
          fields.push(field)
          placeholders.push(`@${field}`)
          values[field] = +!!data[field]
          break;
        default:
          fields.push(field)
          placeholders.push(`@${field}`)
          values[field] = data[field]
          break;
      }
    }

    sql += `(${fields.join(", ")}) = (${placeholders.join(", ")})`

    sql += " WHERE id = @id AND guildFlake = @guildFlake AND userFlake = @userFlake"

    const update = this.db.prepare(sql)
    return update.run({
      id,
      guildFlake: this.guildId,
      userFlake: this.userId,
      ...values
    })
  }

  /**
   * Get the number of saved rolls for this guild and user
   *
   * @return {int} Number of saved rolls for the guild and user
   */
  count() {
    const select = this.db.prepare(oneLine`
      SELECT count(1) FROM saved_rolls
      WHERE guildFlake = ? AND userFlake = ?
    `)
    select.pluck()
    return select.get(this.guildId, this.userId)
  }

  /**
   * Check whether a given name is in use for this guild and user
   *
   * @param  {str}  name The name to check
   * @return {bool}      True if a saved roll exists for this guild and user with the given name, false if not
   */
  taken(name) {
    const select = this.db.prepare(oneLine`
      SELECT 1 FROM saved_rolls
      WHERE guildFlake = @guildFlake AND userFlake = @userFlake AND name = @name
    `)
    select.pluck()
    return !!select.get({
      guildFlake: this.guildId,
      userFlake: this.userId,
      name,
    })
  }

  /**
   * Delete a saved_roll record
   *
   * Can only delete a saved roll for our guild and user.
   *
   * @param  {int} id The ID of the rollable to delete
   * @return {Info}   Query info object with `changes` and `lastInsertRowid` properties
   */
  destroy(id) {
    const destroy = this.db.prepare(oneLine`
      DELETE FROM saved_rolls
      WHERE id = @id AND guildFlake = @guildFlake AND userFlake = @userFlake
    `)
    return destroy.run({
      id,
      guildFlake: this.guildId,
      userFlake: this.userId,
    })
  }
}

/**
 * Create the saved_rolls database table and its indexes
 */
function setup(db_obj) {
  const db = db_obj ?? require("./index").db
  const fs = require("fs")
  const path = require("path")

  const file_path = path.join(__dirname, "saved_rolls.setup.sql")
  const setup_sql = fs.readFileSync(file_path, "utf8")
  db.exec(setup_sql)
}

module.exports = {
  UserSavedRolls,
  setup,
}