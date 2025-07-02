const { oneLine } = require("common-tags")
const Joi = require("joi")

/**
 * Convert an object into vars suitable for use in UPDATE sql
 *
 * For intended use, see update().
 *
 * Normal use is in safe mode, where the restricted fields id, guildFlake, and userFlake are always omitted
 * from the returned data. When `safe` is false, these values are included and may be changed with incautious
 * use.
 *
 * @param  {obj}     data Object of data to convert
 * @param  {boolean} safe Whether to exclude restricted fields
 * @return {obj}          Object of fields, placeholders, and values to use in generating an UPDATE call
 */
function makeUpdateFields(data, safe = true) {
  const fields = []
  const placeholders = []
  const values = {}

  for (const field in data) {
    switch (field) {
      case "options":
        fields.push(field)
        placeholders.push("JSONB(@options)")
        values.options = JSON.stringify(data.options)
        break
      case "invalid":
        fields.push(field)
        placeholders.push(`@${field}`)
        values[field] = +!!data[field]
        break
      case "id":
      case "guildFlake":
      case "userFlake":
        if (!safe) {
          fields.push(field)
          placeholders.push(`@${field}`)
          values[field] = data[field]
        }
        break
      default:
        fields.push(field)
        placeholders.push(`@${field}`)
        values[field] = data[field]
        break
    }
  }

  return {
    fields,
    placeholders,
    values,
  }
}

/**
 * Class for manipulating saved_rolls database records tied to a guild and a user
 */
class UserSavedRolls {
  /**
   * ID of the guild to use
   * @type str
   */
  guildId

  /**
   * ID of the user to use
   * @type str
   */
  userId

  /**
   * Database object
   * @type Database
   */
  db

  constructor(guildId, userId, db_obj) {
    this.guildId = guildId
    this.userId = userId
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Create a new saved roll record
   *
   * The convention for `command_name` is to use the command object's name attribute, prefixed with the name
   * of its parent command and a space, if it has a parent.
   *
   * @param  {str}  name        Name for the saved roll
   * @param  {str}  description Description for the saved roll
   * @param  {str}  command     Command the saved roll will invoke
   * @param  {obj}  options     Object of command options
   * @param  {bool} invalid     Whether this roll's options are unusable
   * @return {Info}             Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If `name` already exists for this guild and user
   */
  create({ name, description, command, options, invalid }) {
    const insert = this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO saved_rolls (
        guildFlake,
        userFlake,
        name,
        description,
        command,
        options,
        invalid
      ) VALUES (
        @guildFlake,
        @userFlake,
        @name,
        @description,
        @command,
        JSONB(@options),
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
      invalid: +!!invalid,
    })
  }

  /**
   * Insert or update a saved roll record
   *
   * This method aborts on errors from name collision.
   *
   * Although this returns an object with `lastInsertRowid`, that value should be ignored. The query as
   * executed may or may not have inserted a row, so as per the [documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#runbindparameters---object),
   * the value should be discarded.
   *
   * @param  {obj} data Object of new values to set. In case of an update, any attributes not present in `data` will be left unchanged.
   * @return {Info}     Query info object with `changes`
   */
  upsert(data) {
    if (data.hasOwnProperty("guildFlake")) delete data.guildFlake
    if (data.hasOwnProperty("userFlake")) delete data.userFlake

    const { fields, placeholders, values } = makeUpdateFields(data, false)

    const sql = oneLine`
      INSERT INTO saved_rolls
      (
        guildFlake,
        userFlake,
        ${fields.join(", ")}
      )
      VALUES
      (
        @guildFlake,
        @userFlake,
        ${placeholders.join(", ")}
      )
      ON CONFLICT (id)
      DO UPDATE SET
      (
        ${fields.join(", ")}
      ) = (
        ${fields.map((f) => `excluded.${f}`).join(", ")}
      )
    `
    const upsert = this.db.prepare(sql)
    return upsert.run({
      guildFlake: this.guildId,
      userFlake: this.userId,
      ...values,
    })
  }

  /**
   * Get an array of all saved rolls for this user and guild
   *
   * Each object in the array represents a single saved roll.
   *
   * @return {obj[]} Array of saved roll objects
   */
  all() {
    const select = this.db.prepare(oneLine`
      SELECT *, JSON_EXTRACT(options, '$') AS options FROM saved_rolls
      WHERE guildFlake = ? AND userFlake = ?
    `)
    const raw_out = select.all(this.guildId, this.userId)

    return raw_out.map((raw) => ({
      ...raw,
      options: JSON.parse(raw.options),
      invalid: !!raw.invalid,
    }))
  }

  /**
   * Get all stored data about a saved roll
   *
   * This method accepts either a saved roll ID or a name. At least one must be provided. If both are given, it
   * will prefer the ID.
   *
   * Empty columns are returned as `null`.
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
    const { fields, placeholders, values } = makeUpdateFields(data)

    const sql = oneLine`
      UPDATE OR ROLLBACK saved_rolls SET
      (${fields.join(", ")}) = (${placeholders.join(", ")})
      WHERE id = @id AND guildFlake = @guildFlake AND userFlake = @userFlake
    `

    const update = this.db.prepare(sql)
    return update.run({
      id,
      guildFlake: this.guildId,
      userFlake: this.userId,
      ...values,
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
   * @param  {int} id The ID of the saved roll to delete
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
 * Class for manipulating all saved_rolls database records
 *
 * Unlike UserSavedRolls, this class is NOT SAFE for general use. It is meant to be used by internal scripts
 * only and should never be used in user-facing code.
 */
class GlobalSavedRolls {
  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Create a new saved roll record
   *
   * The convention for `command_name` is to use the command object's name attribute, prefixed with the name
   * of its parent command and a space, if it has a parent.
   *
   * @param  {str} guildFlake   ID of the guild
   * @param  {str} userFlake    ID of the user
   * @param  {str} name         Name for the saved roll
   * @param  {str} description  Description for the saved roll
   * @param  {str} command      Command the saved roll will invoke
   * @param  {obj}  options     Object of command options
   * @param  {bool} invalid     Whether this roll's options are unusable
   * @return {Info}             Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If `name` already exists for this guild
   */
  create({ guildFlake, userFlake, name, description, command, options, invalid }) {
    const insert = this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO saved_rolls (
        guildFlake,
        userFlake,
        name,
        description,
        command,
        options,
        invalid
      ) VALUES (
        @guildFlake,
        @userFlake,
        @name,
        @description,
        @command,
        JSONB(@options),
        @invalid
      )
    `)
    return insert.run({
      guildFlake,
      userFlake,
      name,
      description,
      command,
      options: JSON.stringify(options),
      invalid: +!!invalid,
    })
  }

  /**
   * Get an array of all saved rolls
   *
   * Each object in the array represents a single saved roll.
   *
   * @return {obj[]}  Array of saved roll objects
   */
  all() {
    const select = this.db.prepare(oneLine`
      SELECT *, JSON_EXTRACT(options, '$') AS options FROM saved_rolls
    `)
    const raw_out = select.all()

    return raw_out.map((raw) => ({
      ...raw,
      options: JSON.parse(raw.options),
      invalid: !!raw.invalid,
    }))
  }

  /**
   * Get all stored data about a saved roll
   *
   * The `options` are parsed into an object before being returned.
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
   * //   invalid: false,
   * // }
   * ```
   *
   * @param  {int} id   ID of the saved roll to get
   * @return {obj}      Object with all the fields of the saved roll
   */
  detail(id) {
    let sql = oneLine`
      SELECT *, JSON_EXTRACT(options, '$') AS options
      FROM saved_rolls
      WHERE id = @id
    `

    const select = this.db.prepare(sql)
    const raw_out = select.get({ id })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      options: JSON.parse(raw_out.options),
      invalid: !!raw_out.invalid,
    }
  }

  /**
   * Update an existing saved roll
   *
   * This method will only update the values that are passed in as part of `data`. Because this method can
   * change the saved roll's `name`, the `id` field is required.
   *
   * When updating the `name` to a value that already exists for a given guild and user, this method will
   * throw an error and roll back any transaction it's in.
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
   * @throws {SqliteError} If the new `name` already exists for a given guild and user
   * @throws {SqliteError} If `data` is empty
   */
  update(id, data) {
    const { fields, placeholders, values } = makeUpdateFields(data, false)

    const sql = oneLine`
      UPDATE OR ROLLBACK saved_rolls SET
      (${fields.join(", ")}) = (${placeholders.join(", ")})
      WHERE id = @id
    `

    const update = this.db.prepare(sql)
    return update.run({
      id,
      ...values,
    })
  }

  /**
   * Get the number of saved rolls
   *
   * @return {int} Number of saved rolls
   */
  count() {
    const select = this.db.prepare(oneLine`
      SELECT count(1) FROM saved_rolls
    `)
    select.pluck()
    return select.get()
  }
}

module.exports = {
  makeUpdateFields,
  UserSavedRolls,
  GlobalSavedRolls,

  /**
   * Minimal schema to validate saved roll attributes
   *
   * This is not for validating database records. Instead, it is for validating incoming data from other code.
   * That's why attributes like `id`` which are required by the database are optional in this schema.
   *
   * @type {Joi.object}
   */
  saved_roll_schema: Joi.object({
    id: Joi.number().integer().optional(),
    guildFlake: Joi.string().optional(),
    userFlake: Joi.string().optional(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    command: Joi.string().required(),
    options: Joi.object().required(),
    invalid: Joi.boolean().optional(),
  }),
}
