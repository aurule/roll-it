const { Collection } = require("discord.js")

const { oneLine } = require("common-tags")

/**
 * Message type enum
 * @type {Object}
 */
const MessageType = Object.freeze({
  Prompt: 1,
  Plain: 2,
})

/**
 * Class to manage teamwork state tracking
 */
class Teamwork {
  /**
   * Database object
   * @type Database
   */
  db

  /**
   * Create a new Teamwork object
   * @param  {Database} db_obj Sqlite database object
   * @return {Teamwork}        New Teamwork object
   */
  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Add a teamwork test
   *
   * The options is an object with three sets of arbitrary parameters that are passed to the command's
   * teamwork roller, summer, and presenter methods.
   *
   * @param  {object}    options
   * @param  {str}       options.command     Name of the command to roll
   * @param  {object}    options.options     Options object
   * @param  {Snowflake} options.leader      Discord ID of the user who can roll the test
   * @param  {str}       options.locale      Localization locale code
   * @param  {Snowflake} options.channelId   Discord ID of the channel where the test was started
   * @param  {str}       options.description Optional description of the test
   * @param  {int}       options.timeout     Number of seconds after which the test should be considered expired
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addTeamwork({ command, options, leader, locale, channelId, description, timeout = 0 } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.teamwork_tests (
        command,
        options,
        leader,
        locale,
        channel_uid,
        description,
        expires_at
      ) VALUES (
        @command,
        JSONB(@options),
        @leader,
        @locale,
        @channel_uid,
        @description,
        datetime('now', @timeout || ' seconds')
      )
    `)

    return insert.run({
      command,
      options: JSON.stringify(options),
      leader,
      locale,
      channel_uid: channelId,
      description,
      timeout,
    })
  }

  /**
   * Get a teamwork record
   *
   * This method adds an `expired` property for convenience.
   *
   * @param  {int} id Internal ID of the teamwork record
   * @return {obj}    Teamwork object
   */
  detail(id) {
    const select = this.db.prepare(oneLine`
      SELECT *,
             JSON_EXTRACT(options, '$') AS options,
             TIME('now') > TIME(expires_at) AS expired
      FROM interactive.teamwork_tests
      WHERE id = @id
    `)

    const raw_out = select.get({
      id,
    })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      options: JSON.parse(raw_out.options),
      expired: !!raw_out.expired,
    }
  }

  /**
   * Remove a teamwork test
   *
   * @param  {int} id Internal ID of the teamwork record
   * @return {Info}   Query info object with `changes` and `lastInsertRowid` properties
   */
  destroy(id) {
    const destroy = this.db.prepare(oneLine`
      DELETE FROM interactive.teamwork_tests WHERE id = @id
    `)
    return destroy.run({
      id,
    })
  }

  /**
   * Get whether a message belongs to an expired test
   *
   * @param  {Snowflake} message_id Discord ID of the message to test
   * @return {Boolean}              True if the message's test is expired, false if not
   */
  isMessageExpired(message_id) {
    const select = this.db.prepare(oneLine`
      SELECT TIME('now') > TIME(t.expires_at) AS expired
      FROM   interactive.teamwork_tests AS t
             JOIN interactive.teamwork_messages AS m
               ON t.id = m.teamwork_id
      WHERE  m.message_uid = ?
    `)
    select.pluck()

    return !!select.get(message_id)
  }

  /**
   * Add a message that can be used to find a teamwork test
   *
   * This lets users reply to a message in order to help.
   *
   * @param  {object}    options
   * @param  {Snowflake} options.message_uid Discord ID of the message
   * @param  {int}       options.teamwork_id Internal ID of the teamwork record
   * @param  {int}       options.type        Message type code
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addMessage({ message_uid, teamwork_id, type = MessageType.Plain } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.teamwork_messages (
        message_uid,
        message_type,
        teamwork_id
      ) VALUES (
        @message_uid,
        @message_type,
        @teamwork_id
      )
    `)

    return insert.run({
      message_uid,
      message_type: type,
      teamwork_id,
    })
  }

  /**
   * Get whether a message is logged
   *
   * @param  {Snowflake} message_uid Discord ID of the message to check
   * @return {Boolean}               True if the message is present, false if not.
   */
  hasMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT 1 FROM interactive.teamwork_messages
      WHERE message_uid = ?
    `)
    select.pluck()

    return !!select.get(message_uid)
  }

  /**
   * Get the Discord ID of the first message of a teamwork test
   * @param  {int}       teamwork_id Internal ID of the teamwork record
   * @return {Snowflake}             Discord ID of the initial message
   */
  getPromptUid(teamwork_id) {
    const select = this.db.prepare(oneLine`
      SELECT message_uid
      FROM interactive.teamwork_messages
      WHERE teamwork_id = @teamwork_id AND message_type = 1
    `)
    select.pluck()

    return select.get({
      teamwork_id,
    })
  }

  /**
   * Get the teamwork test associated with a Discord message ID
   *
   * This method adds an `expired` property for convenience.
   *
   * @param  {Snowflake} message_uid Discord ID of the message
   * @return {int}                   Internal ID of the associated teamwork test
   */
  findTestByMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT t.*,
             JSON_EXTRACT(t.options, '$') as options,
             TIME('now') > TIME(t.expires_at) AS expired
      FROM   interactive.teamwork_tests AS t
             JOIN interactive.teamwork_messages AS m
               ON t.id = m.teamwork_id
      WHERE  m.message_uid = @message_uid
    `)

    const raw_out = select.get({
      message_uid,
    })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      options: JSON.parse(raw_out.options),
      expired: !!raw_out.expired,
    }
  }

  /**
   * Sum the dice of all helpers for a test
   *
   * @param  {int} teamwork_id Internal ID of the teamwork test
   * @return {int}             Total number of dice to roll
   */
  getFinalSum(test_id) {
    const select = this.db.prepare(oneLine`
      SELECT SUM(dice) as total
      FROM   interactive.teamwork_helpers
      WHERE  teamwork_id = ?
    `)
    select.pluck()

    const raw_out = select.get(test_id)

    if (raw_out === null) return undefined

    return raw_out
  }

  /**
   * Add a helper record
   *
   * @param  {int}       options.teamwork_id Internal ID of the teamwork test
   * @param  {Snowflake} options.userId      Discord ID of the user
   * @param  {int}       options.dice        Number of dice that user is contributing
   * @param  {bool}      options.requested   Whether the user's help was requested by the leader
   * @return {Info}                          Query info object with `changes` and `lastInsertRowid` properties
   */
  addHelper({ teamwork_id, userId, dice = null, requested = false } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.teamwork_helpers (
        teamwork_id,
        user_uid,
        dice,
        requested
      ) VALUES (
        @teamwork_id,
        @user_uid,
        @dice,
        @requested
      )
    `)

    return insert.run({
      teamwork_id,
      user_uid: userId,
      dice,
      requested: +!!requested,
    })
  }

  /**
   * Set the requested flag for all helpers on a given test
   *
   * This sets the requested flag to true for users in the `helpers` list, and sets it to false for all other
   * helper records related to the given test. Users who are requested by do not yet have a record will be
   * added with dice of null.
   *
   * @param {int}         teamwork_id Internal ID of the teamwork test
   * @param {Snowflake[]} helpers     Array of Discord IDs of users whose helper records should have the requested flag set to true
   */
  setRequestedHelpers(teamwork_id, helpers) {
    const setRequested = this.db.transaction((teamwork_id, helpers) => {
      const update = this.db.prepare(oneLine`
        UPDATE interactive.teamwork_helpers SET requested = 0 WHERE teamwork_id = ?
      `)
      update.run(teamwork_id)

      if (helpers.length < 1) return

      const remainder = ", (@teamwork_id, 1, ?)".repeat(helpers.length - 1)
      const upsert = this.db.prepare(oneLine`
        INSERT INTO interactive.teamwork_helpers (
          teamwork_id,
          requested,
          user_uid
        ) VALUES (@teamwork_id, 1, ?)${remainder}
        ON CONFLICT (teamwork_id, user_uid) DO UPDATE SET requested = 1
      `)
      upsert.run(
        {
          teamwork_id,
        },
        helpers,
      )
    })

    return setRequested(teamwork_id, helpers)
  }

  /**
   * Get the list of helper records that are requested
   *
   * @param  {int}   teamwork_id Internal ID of the teamwork test
   * @return {obj[]}             Array of helper record objects
   */
  getRequestedHelpers(teamwork_id) {
    const select = this.db.prepare(oneLine`
      SELECT *
      FROM   interactive.teamwork_helpers
      WHERE  teamwork_id = ?
        AND  requested = 1
      ORDER  BY requested DESC,
                id ASC
    `)

    return select.all(teamwork_id)
  }

  /**
   * Get a single user's helper record
   *
   * @param  {int}       teamwork_id Internal ID of the teamwork test
   * @param  {Snowflake} helper_uid  Discord ID of the helping user
   * @return {Helper}                Helper object
   */
  getHelperDetails(teamwork_id, helper_uid) {
    const select = this.db.prepare(oneLine`
      SELECT *
      FROM   interactive.teamwork_helpers
      WHERE  teamwork_id = @teamwork_id
        AND  user_uid = @user_uid
      LIMIT  1
    `)

    return select.get({
      teamwork_id,
      user_uid: helper_uid,
    })
  }

  /**
   * Set the dice for a helper
   *
   * This will create a new helper record for the given user if one does not already exist.
   *
   * @param  {int}       teamwork_id Internal ID of the test
   * @param  {Snowflake} user_id     Discord ID of the user adding dice
   * @param  {int}       dice        Number of dice they're contributing to the pool
   * @return {Info}                  Query info object with `changes` and `lastInsertRowid` properties
   */
  setDice(teamwork_id, user_id, dice) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.teamwork_helpers (
        teamwork_id,
        user_uid,
        dice
      ) VALUES (
        @teamwork_id,
        @user_uid,
        @dice
      ) ON CONFLICT (teamwork_id, user_uid) DO UPDATE SET dice = excluded.dice
    `)

    return insert.run({
      teamwork_id,
      user_uid: user_id,
      dice,
    })
  }

  /**
   * Get all helper records for a teamwork test
   *
   * @param  {int}   teamwork_id Internal ID of the teamwork test
   * @return {obj[]}             Array of helper record objects
   */
  allHelpers(teamwork_id) {
    const select = this.db.prepare(oneLine`
      SELECT *
      FROM   interactive.teamwork_helpers
      WHERE  teamwork_id = ?
      ORDER  BY requested DESC, id ASC
    `)

    const raw_out = select.all(teamwork_id)

    if (raw_out === undefined) return undefined

    return raw_out.map((r) => {
      return {
        ...r,
        requested: !!r.requested,
      }
    })
  }

  /**
   * Get helper records with non-null dice for a teamwork test
   *
   * @param  {int}   teamwork_id Internal ID of the teamwork test
   * @return {obj[]}             Array of helper record objects
   */
  realHelpers(teamwork_id) {
    const select = this.db.prepare(oneLine`
      SELECT *
      FROM   interactive.teamwork_helpers
      WHERE  teamwork_id = ?
        AND  dice IS NOT NULL
      ORDER  BY requested DESC,
                id ASC
    `)

    return select.all(teamwork_id)
  }
}

module.exports = {
  MessageType,
  Teamwork,
}
