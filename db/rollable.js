const { logger } = require("../util/logger")
const { oneLine } = require("common-tags")
const { db } = require("./index")

/**
 * Class to handle the management of rollable tables in the database, scoped to a single guild
 *
 * This is the preferred method of interacting with the rollable storage, both for safety and convenience.
 *
 * Due to the way tables are rolled, a table which has the same result for values 1-5 will need to duplicate
 * that result five times in its contents.
 */
class Rollables {
  constructor(guildId) {
    this.guildId = guildId
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
    const insert = db.prepare(oneLine`
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
    const select = db.prepare(oneLine`
      SELECT id, name, description, die FROM rollable
      WHERE guildFlake = ?
    `)
    return select.all(this.guildId)
  }

  /**
   * Get all stored data about a rollable
   *
   * The `contents` are parsed into an array before being returned. For safety, the query is still scoped to
   * the current guild.
   *
   * @param  {int} id ID of the rollable to get
   * @return {obj}    Object with all the fields of the rollable
   */
  detail(id) {
    const select = db.prepare(oneLine`
      SELECT *, JSON_EXTRACT(contents, '$') AS contents
      FROM rollable
      WHERE id = @id AND guildFlake = @guildFlake
    `)
    const raw_out = select.get({ id, guildFlake: this.guildId })

    return {
      ...raw_out,
      contents: JSON.parse(raw_out.contents),
    }
  }

  /**
   * Get a random result from the table
   *
   * This rolls the `die` inside sql and picks the given result from the stored table. This should make it
   * nearly impossible to roll an invalid result. For safety, the query is still scoped to the current guild.
   *
   * @param  {int} id ID of the table to roll
   * @return {str}    Table entry
   */
  random(id) {
    const select = db.prepare(oneLine`
      SELECT contents -> ABS(RANDOM() % die) AS result
      FROM rollable
      WHERE id = @id AND guildFlake = @guildFlake
    `)
    select.pluck()
    return select.get({
      id,
      guildFlake: this.guildId,
    })
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
    const { name, description, contents } = data

    let sql = "UPDATE OR ROLLBACK rollable SET"

    if (name) sql += " name = @name"
    if (description) sql += " description = @description"
    if (contents) sql += " contents = JSONB(@contents)"

    sql += " WHERE id = @id AND guildFlake = @guildFlake"

    const update = db.prepare(sql)
    return update.run({
      id,
      guildFlake: this.guildId,
      name,
      description,
      contents: JSON.stringify(contents),
    })
  }

  /**
   * Get the number of rollables for this guild
   *
   * @return {int} Number of rollables for the guild
   */
  count() {
    const select = db.prepare(oneLine`
      SELECT count(1) FROM rollable
      WHERE guildFlake = ?
    `)
    select.pluck()
    return select.get(this.guildId)
  }
}

/**
 * Create the rollable database table and its indexes
 */
function setup() {
  const tableStmt = db.prepare(oneLine`
    CREATE TABLE IF NOT EXISTS rollable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildFlake TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      die INTEGER,
      contents BLOB NOT NULL
    )
  `)
  tableStmt.run()

  // multicol index starting with guildFlake
  // speeds up querying by guildFlake, or flake+name
  const indexStmt = db.prepare(oneLine`
    CREATE UNIQUE INDEX IF NOT EXISTS rollable_guild_name
    ON rollable (guildFlake, name)
  `)
  indexStmt.run()

  // set up the trigger to set the die size for new rollables
  const insertTriggerStmt = db.prepare(oneLine`
    CREATE TRIGGER IF NOT EXISTS new_rollable_die
    AFTER INSERT ON rollable
    BEGIN
      UPDATE rollable SET die = JSON_ARRAY_LENGTH(NEW.contents) WHERE id = NEW.id;
    END
  `)
  insertTriggerStmt.run()

  // set up the trigger to set the die size for old rollables when their contents are changed
  const updateTriggerStmt = db.prepare(oneLine`
    CREATE TRIGGER IF NOT EXISTS old_rollable_die
    AFTER UPDATE OF contents ON rollable
    BEGIN
      UPDATE rollable SET die = JSON_ARRAY_LENGTH(NEW.contents) WHERE id = NEW.id;
    END
  `)
  updateTriggerStmt.run()
}

/**
 * Populate the development database with some rollables
 *
 * Each guild in the envvar DEV_GUILDS gets a copy of each rollable specified in `rollable.seed.json`. The
 * errors from duplicate inserts are suppressed for convenience.
 *
 * Outside of development mode, this is a noop.
 */
function seed() {
  if (process.env.NODE_ENV !== "development") return

  const fs = require("fs")
  const path = require("path")

  const file_path = path.join(__dirname, "rollable.seed.json")
  const seed_rollables = JSON.parse(fs.readFileSync(file_path))
  const dev_guilds = JSON.parse(process.env.DEV_GUILDS)

  for (const guildId of dev_guilds) {
    const rollables = new Rollables(guildId)
    for (const r of seed_rollables) {
      try {
        rollables.create(r.name, r.description, r.contents)
      } catch (e) {
        continue
      }
    }
  }
}

module.exports = {
  Rollables,
  setup,
  seed,
}
