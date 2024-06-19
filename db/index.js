const { logger } = require("../util/logger")

const Database = require('better-sqlite3');

require("dotenv").config()

function pickDatabaseFile() {
  switch(process.env.NODE_ENV) {
    case "development":
      return "../roll-it.dev.db"
    case "test":
    case "ci":
      return ":memory:"
    case "production":
      return "../roll-it.prod.db"
  }
}

const db = new Database(pickDatabaseFile(), { verbose: logger.debug });

module.exports = {
  db,
  pickDatabaseFile
}
