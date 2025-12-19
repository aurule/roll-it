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
}

module.exports = {
  Installation,
}
