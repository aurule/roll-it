const { logger } = require("../util/logger")
const fs = require("fs")
const path = require("path")

const Database = require("better-sqlite3")

require("dotenv").config()

/**
 * Get the correct database path for our environment
 *
 * Dev and prod both use real files, while test and ci environments use an in-memory database.
 *
 * @return {str} String to the sqlite database path to use
 */
function pickDatabaseFile() {
  switch (process.env.NODE_ENV) {
    case "development":
      return path.join(__dirname, "..", ".sqlite", "roll-it.dev.db")
    case "test":
    case "ci":
      return ":memory:"
    case "production":
      return path.join(__dirname, "..", "..", "roll-it.prod.db")
  }
}

/**
 * Create a database connection
 *
 * This is mainly for use in tests, where each test should be isolated from the rest.
 *
 * @param  {Object} db_options Options to pass to the new connection
 * @return {Database}          Database connection object
 */
function makeDB(db_options = {}) {
  const db = new Database(pickDatabaseFile(), {
    verbose: (sql) => logger.debug(sql),
    ...db_options,
  })

  const sql_files = fs.readdirSync(__dirname).filter((str) => str.endsWith(".sql"))
  sql_files.forEach((sql_file) => {
    const setup_sql = fs.readFileSync(path.join(__dirname, sql_file), "utf8")
    db.exec(setup_sql)
  })

  return db
}

module.exports = {
  db: makeDB(),
  makeDB,
  pickDatabaseFile,
}
