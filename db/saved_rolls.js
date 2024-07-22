const { oneLine } = require("common-tags")

class UserSavedRolls {
  constructor(guildId, userId, db_obj) {
    this.guildId = guildId
    this.userId = userId
    this.db = db_obj ?? require("./index").db
  }

  // create
  // all
  // detail
  // update
  // taken
  // exists
  // destroy
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
