const { oneLine } = require("common-tags");
const { CachedDb } = require("./cached-db");

class Installation extends CachedDb {
  /**
   * Create a new installation record
   *
   * @param  {object}    options
   * @param  {string}    options.locale    Locale code
   * @param  {Snowflake} options.guild_uid Discord guild ID
   * @param  {Snowflake} options.user_uid  Discord user ID
   * @param  {string}    options.state     State of the installation
   * @param  {object}    options.old_deets Object of existing systems, features, and commands
   * @param  {object}    options.new_deets Object of to-set systems, features, and commands
   * @param  {number}    options.timeout   Number of seconds before the installation times out
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addInstallation({
    locale,
    guild_uid,
    user_uid,
    state,
    old_deets = {},
    new_deets = {},
    timeout,
  } = {}) {
    const insert = this.prepared(
      "addInstallation",
      oneLine`
      INSERT INTO interactive.installation_processes (
        locale,
        guild_uid,
        user_uid,
        state,
        old_deets,
        new_deets,
        expires_at
      ) VALUES (
        @locale,
        @guild_uid,
        @user_uid,
        @state,
        JSONB(@old_deets),
        JSONB(@new_deets),
        DATETIME('now', @timeout || ' seconds')
      )
    `,
    )

    return insert.run({
      locale,
      guild_uid,
      user_uid,
      state,
      old_deets: JSON.stringify(old_deets),
      new_deets: JSON.stringify(new_deets),
      timeout,
    })
  }

  /**
   * Get the total number of installation records
   * @return {number} Total number of installation records
   */
  installationCount() {
    const select = this.prepared(
      "installationCount",
      oneLine`
        SELECT COUNT(1)
        FROM   interactive.installation_processes
      `,
      true)

    return select.get()
  }

  /**
   * Remove an installation record
   *
   * @param  {number} id Internal ID of the installation record
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  destroy(id) {
    const destroy = this.prepared(
      "destroy",
      oneLine`
        DELETE FROM interactive.installation_processes WHERE id = ?
      `,
    )

    return destroy.run(id)
  }

  /**
   * Get an installation record
   *
   * @param  {number} id Internal ID of the installation record
   * @return {object}    Installation object
   */
  getInstallation(id) {
    const select = this.prepared(
      "getInstallation",
      oneLine`
        SELECT *,
               JSON_EXTRACT(old_deets, '$') AS old_deets,
               JSON_EXTRACT(new_deets, '$') AS new_deets,
               DATETIME('now') > DATETIME(expires_at) AS expired
        FROM   interactive.installation_processes
        WHERE  id = ?
      `)

    const raw_out = select.get(id)

    if (raw_out === undefined) return undefined

    // this should probably be a specialty object
    return {
      ...raw_out,
      old_deets: JSON.parse(raw_out.old_deets),
      new_deets: JSON.parse(raw_out.new_deets),
      expired: !!raw_out.expired,
    }
  }

  /**
   * Add a new message record
   *
   * @param  {object}    options
   * @param  {Snowflake} options.message_uid     Discord ID of the message
   * @param  {number}    options.installation_id Internal ID of the associated installation
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addMessage({ message_uid, installation_id }) {
    const insert = this.prepared(
      "addMessage",
      oneLine`
      INSERT INTO interactive.installation_messages (
        message_uid,
        installation_id
      ) VALUES (
        @message_uid,
        @installation_id
      )
    `,
    )

    return insert.run({
      message_uid,
      installation_id,
    })
  }

  /**
   * Get whether a message UID is stored
   * @param  {Snowflake} message_uid Discord message ID
   * @return {Boolean}               True if the message is stored, false if not
   */
  hasMessage(message_uid) {
    const select = this.prepared(
      "hasMessage",
      oneLine`
        SELECT 1 FROM interactive.installation_messages
        WHERE message_uid = ?
      `,
      true,
    )

    return !!select.get(message_uid)
  }

  /**
   * Get the message record for a given ID
   * @param  {number} message_id Internal ID of the message
   * @return {object}            Message object or undefined if not found
   */
  getMessage(message_id) {
    const select = this.prepared(
      "getMessage",
      oneLine`
      SELECT *
      FROM   interactive.installation_messages
      WHERE  id = ?
    `,
    )

    return select.get(message_id)
  }
}

module.exports = {
  Installation,
}
