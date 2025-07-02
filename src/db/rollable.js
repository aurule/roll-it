const { oneLine } = require("common-tags")

/**
 * Class to handle the management of rollable tables in the database, scoped to a single guild
 *
 * This is the preferred method of interacting with the rollable storage, both for safety and convenience.
 *
 * Due to the way tables are rolled, a table which has the same result for values 1-5 will need to duplicate
 * that result five times in its contents.
 */
class GuildRollables {
  /**
   * ID of the guild to use
   * @type str
   */
  guildId

  /**
   * Database object
   * @type Database
   */
  db

  constructor(guildId, db_obj) {
    this.guildId = guildId
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Insert a new rollable record for the guild
   *
   * The rollable's `die` attribute is set automatically with a database trigger, so it does not need to be
   * included.
   *
   * The rollable name is unique within the guild. If the given name is already in use, this method will
   * throw an error and roll back any transaction it's in.
   *
   * @param  {str}   name        Unique name of the new rollable
   * @param  {str}   description Descriptive text for the new rollable
   * @param  {str[]} contents    Array of strings that are the rollable's contents
   * @return {Info}              Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If `name` already exists for this guild
   */
  create(name, description, contents) {
    const insert = this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO rollable (
        guildFlake,
        name,
        description,
        contents
      ) VALUES (
        @guildFlake,
        @name,
        @description,
        JSONB(@contents)
      )
    `)
    return insert.run({
      guildFlake: this.guildId,
      name,
      description,
      contents: JSON.stringify(contents),
    })
  }

  /**
   * Get an array of all rollables for this guild
   *
   * Each object in the array represents a single rollable, and has the `id`, `name`, `description`, and `die`
   * fields. The contents are not returned by this method, as they are generally not needed in bulk.
   *
   * @return {obj[]} Array of rollable info objects
   */
  all() {
    const select = this.db.prepare(oneLine`
      SELECT id, name, description, die FROM rollable
      WHERE guildFlake = ?
    `)
    return select.all(this.guildId)
  }

  /**
   * Get all stored data about a rollable
   *
   * This method accepts either a rollable ID or a name. At least one must be provided. If both are given, it
   * will prefer the ID.
   *
   * The `contents` are parsed into an array before being returned.
   *
   * For safety, the query is always scoped to the current guild.
   *
   * @example
   * ```js
   * rollables.detail(3)
   * // returns {
   * //   id: 3,
   * //   name: "Test Table",
   * //   description: "A table for testing",
   * //   die: 10,
   * //   contents: [
   * //     "first entry",
   * //     "second entry",
   * //     ...
   * //     "tenth entry",
   * //   ],
   * // }
   * ```
   *
   * @param  {int} id   ID of the rollable to get
   * @param  {str} name Name of the rollable to get
   * @return {obj}      Object with all the fields of the rollable
   */
  detail(id, name) {
    let sql = oneLine`
      SELECT *, JSON_EXTRACT(contents, '$') AS contents
      FROM rollable
      WHERE
    `

    if (id) {
      sql += " id = @id AND guildFlake = @guildFlake"
    } else if (name) {
      sql += " guildFlake = @guildFlake AND name = @name"
    }

    const select = this.db.prepare(sql)
    const raw_out = select.get({
      id,
      name,
      guildFlake: this.guildId,
    })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      contents: JSON.parse(raw_out.contents),
    }
  }

  /**
   * Get a random result from a rollable
   *
   * This method accepts either a rollable ID or a name. At least one must be provided. If both are given, it
   * will prefer the ID.
   *
   * This rolls the `die` inside sql and picks the given result from the stored rollable. This should make it
   * nearly impossible to roll an invalid result. For safety, the query is still scoped to the current guild.
   *
   * @param  {int} id   ID of the rollable to roll
   * @param  {str} name Name of the rollable to roll
   * @return {str}      Rollable entry
   */
  random(id, name) {
    let sql = oneLine`
      SELECT contents -> ABS(RANDOM() % die) AS result
      FROM rollable
      WHERE
    `

    if (id) {
      sql += " id = @id AND guildFlake = @guildFlake"
    } else if (name) {
      sql += " guildFlake = @guildFlake AND name = @name"
    }

    const select = this.db.prepare(sql)
    select.pluck()
    const raw_out = select.get({
      id,
      name,
      guildFlake: this.guildId,
    })

    if (raw_out === undefined) return undefined

    return JSON.parse(raw_out)
  }

  /**
   * Update the values for a given rollable
   *
   * This method will only update the values that are passed in as part of `data`. Because this method can
   * change the rollable's `name`, the `id` field is required. For safety, the update query is still scoped
   * to the current guild.
   *
   * When updating the `name` to a value that already exists, this method will throw an error and roll back
   * any transaction it's in.
   *
   * You *must* supply at least one data attribute when calling this function. Otherwise, it will throw an
   * error.
   *
   * @param  {int}   id               The ID of the rollable to update
   * @param  {obj}   data             The new values to set
   * @param  {str}   data.name        Unique name of the new rollable
   * @param  {str}   data.description Descriptive text for the new rollable
   * @param  {str[]} data.contents    Array of strings that are the rollable's contents
   * @return {Info}                   Query info object with `changes` and `lastInsertRowid` properties
   *
   * @throws {SqliteError} If the new `name` already exists for this guild
   * @throws {SqliteError} If `data` is empty
   */
  update(id, data) {
    const fields = []
    const placeholders = []
    const values = {}

    for (const field in data) {
      switch (field) {
        case "contents":
          fields.push("contents")
          placeholders.push("JSONB(@contents)")
          values.contents = JSON.stringify(data[field])
          break
        case "id":
        case "guildFlake":
          // These attrs are restricted. Skip them.
          break
        default:
          fields.push(field)
          placeholders.push(`@${field}`)
          values[field] = data[field]
          break
      }
    }

    const sql = oneLine`
      UPDATE OR ROLLBACK rollable SET
      (${fields.join(", ")}) = (${placeholders.join(", ")})
      WHERE id = @id AND guildFlake = @guildFlake
    `

    const update = this.db.prepare(sql)
    return update.run({
      id,
      guildFlake: this.guildId,
      ...values,
    })
  }

  /**
   * Get the number of rollables for this guild
   *
   * @return {int} Number of rollables for the guild
   */
  count() {
    const select = this.db.prepare(oneLine`
      SELECT count(1) FROM rollable
      WHERE guildFlake = ?
    `)
    select.pluck()
    return select.get(this.guildId)
  }

  /**
   * Check whether a given name is in use for this guild
   *
   * @param  {str} name The name to check
   * @return {bool}     True if a rollable exists for this guild with the given name, false if not
   */
  taken(name) {
    const select = this.db.prepare(oneLine`
      SELECT 1 FROM rollable
      WHERE guildFlake = @guildFlake AND name = @name
    `)
    select.pluck()
    return !!select.get({
      guildFlake: this.guildId,
      name,
    })
  }

  /**
   * Delete a rollable record
   *
   * For safety, the delete query is still scoped to the current guild.
   *
   * @param  {int} id The ID of the rollable to delete
   * @return {Info}   Query info object with `changes` and `lastInsertRowid` properties
   */
  destroy(id) {
    const destroy = this.db.prepare(oneLine`
      DELETE FROM rollable
      WHERE id = @id AND guildFlake = @guildFlake
    `)
    return destroy.run({
      id,
      guildFlake: this.guildId,
    })
  }
}

module.exports = {
  GuildRollables,
}
