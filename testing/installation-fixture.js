const { Installation } = require("../src/db/installation")

class InstallationFixture {
  /**
   * Database object
   * @type db
   */
  db

  /**
   * Database ID of the associated record
   * @type int
   */
  id

  user_uid = "installer"

  constructor(db_obj) {
    this.db = new Installation(db_obj)

    // create the installation record
    this.id = this.db.addInstallation({
      locale: "en-US",
      guild_uid: "guild",
      user_uid: this.user_uid,
      old_deets: {
        commands: [],
        systems: [],
        features: [],
      },
      timeout: 1000,
    }).lastInsertRowid
  }

  /**
   * Destroy this record and its children
   *
   * Best to call in an afterEach block to keep memory bloat down.
   *
   * @return {Info} Query info object
   */
  cleanup() {
    return this.db.destroy(this.id)
  }

  /**
   * The associated record
   * @type Installation
   */
  get record() {
    return this.db.getInstallation(this.id)
  }

  /**
   * Mark the installation as expired
   * @return {InstallationFixture} This fixture
   */
  expire() {
    this.db.setInstallationExpired(this.id)
    return this
  }

  /**
   * Mark the installation as finished
   * @return {InstallationFixture} This fixture
   */
  finish() {
    this.db.finishInstallation(this.id)
    return this
  }

  /**
   * Add a message record that can be used to look up our install
   * @param  {string}           message_uid Discord ID of the message
   * @return {InstallationFixture}             This fixture
   */
  attachMessage(message_uid) {
    this.db.addMessage({
      message_uid,
      installation_id: this.id,
    })
    return this
  }
}

module.exports = {
  InstallationFixture,
}
