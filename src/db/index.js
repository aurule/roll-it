import { logger } from "../util/logger.js"
import fs from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

/**
 * Get the correct database file path for our environment
 *
 * Dev and prod use a specific location. Other environments are expected to use an in-memory database, so
 * this just returns the current directory for those.
 *
 * @param  {str} env_name Name of the current environment
 * @return {str}          String to the folder where sqlite db files should be stored
 */
export function dbFileParent(env_name = process.env.NODE_ENV) {
  switch (env_name) {
    case "development":
      return path.join(__dirname, "..", "..", ".sqlite")
    case "production":
      return path.join(__dirname, "..", "..")
    default:
      return __dirname
  }
}

/**
 * Get the correct database path for our environment
 *
 * Dev and prod both use real files, while test and ci environments use an in-memory database.
 *
 * @param  {str} env_name Name of the current environment
 * @return {str}          String to the sqlite database file to use
 */
export function mainDatabaseFile(env_name = process.env.NODE_ENV) {
  const parent = dbFileParent(env_name)
  switch (env_name) {
    case "development":
      return path.join(parent, "roll-it.dev.db")
    case "production":
      return path.join(parent, "roll-it.prod.db")
    default:
      return ":memory:"
  }
}

/**
 * Get the correct db file path for storing short-term persistance data for interactive commands
 *
 * Dev and prod both use real files, while test and ci environments use an in-memory database.
 *
 * @param  {str} env_name Name of the current environment
 * @return {str}          String to the sqlite database file to use
 */
export function interactiveDatabaseFile(env_name = process.env.NODE_ENV) {
  const parent = dbFileParent(env_name)
  switch (env_name) {
    case "development":
      return path.join(parent, "roll-it-interactive.dev.db")
    case "production":
      return path.join(parent, "roll-it-interactive.prod.db")
    default:
      return ":memory:"
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
export function makeDB(db_options = {}) {
  const db = new Database(mainDatabaseFile(), {
    verbose: (sql) => logger.debug(sql),
    ...db_options,
  })

  const attach_interactive = db.prepare("ATTACH DATABASE ? AS interactive")
  attach_interactive.run(interactiveDatabaseFile())

  const sql_files = fs.readdirSync(__dirname).filter((str) => str.endsWith(".sql"))
  sql_files.forEach((sql_file) => {
    const setup_sql = fs.readFileSync(path.join(__dirname, sql_file), "utf8")
    db.exec(setup_sql)
  })

  return db
}

export const db = makeDB()
