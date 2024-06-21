const { logger } = require("../util/logger")

const Database = require("better-sqlite3")

require("dotenv").config()

function pickDatabaseFile() {
  switch (process.env.NODE_ENV) {
    case "development":
      const path = require("path")
      return path.join(__dirname, "..", ".sqlite", "roll-it.dev.db")
    case "test":
    case "ci":
      return ":memory:"
    case "production":
      return path.join(__dirname, "..", ".sqlite", "roll-it.prod.db")
  }
}

let db = new Database(pickDatabaseFile(), { verbose: (sql) => logger.debug(sql) })

module.exports = {
  db,
  pickDatabaseFile,
}
