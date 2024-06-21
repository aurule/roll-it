const { oneLine } = require("common-tags")
const { db } = require("./db")

class Rollables {
  constructor(guildId) {
    this.guildId = guildId
  }

  create(name, description, contents) {
    // make a new table with the given data
    // derive die from contents.length
    // validate contents.length is > 1
    // it's caller's job to make sure the name is unique, or to catch the database error that follows
  }

  list() {
    // get name, description, and die for all tables
  }

  length(id) {
    // get the die for the given ID
  }

  result(id, lineNo) {
    // get the string in contents[lineNo]
  }

  update(id, name, description, contents) {
    // alter the given data pieces
    // update die to eq new contents.length
  }

  count() {
    // return simple count of all rollables for the guild
  }

  options() {
    // return name, description and id for every table
  }
}

/**
 * Create the rollable database table and its indexes
 */
create() {
  const tableStmt = db.prepare(
    oneLine`
      CREATE TABLE IF NOT EXISTS rollable (
        id INTEGER PRIMARY KEY,
        guildFlake TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        die INTEGER NOT NULL,
        contents BLOB NOT NULL,
      )
    `
  )
  tableStmt.run()

  // multicol index starting with guildFlake
  // speeds up querying by guildFlake, or flake+name
  const indexStmt = db.prepare(
    oneLine`
      CREATE UNIQUE INDEX IF NOT EXISTS rollable_guild_name
      ON rollable (guildFlake, name)
    `
  )
  indexStmt.run()
}

seed() {
  // populate development data
  // error outside of dev mode
}

module.exports = {
  Rollables,
  create,
  seed
}
