const { logger } = require("../util/logger")

const Database = require('better-sqlite3');

const db = new Database('../roll-it.db', { verbose: logger.debug });

module.exports = {
  db
}
