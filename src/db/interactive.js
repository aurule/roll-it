const { Collection } = require("discord.js")

const { oneLine } = require("common-tags")

const MessageType = {
  Prompt: 1,
  Plain: 2,
}

const ParticipantRoles = {
  Attacker: 1,
  Defender: 2,
}

/**
 * Class to manage teamwork state tracking
 */
class Teamwork {
  /**
   * Database object
   * @type Database
   */
  db

  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Add a teamwork test
   *
   * The options is an object with three sets of arbitrary parameters that are passed to the command's
   * teamwork roller, summer, and presenter methods.
   *
   * @param  {str}       options.command     Name of the command to roll
   * @param  {obj}       options.options     Options object
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
   * @param {Snowflake} options.message_uid Discord ID of the message
   * @param {int}       options.teamwork_id Internal ID of the teamwork record
   * @param {int}       options.type        Message type code
   * @return {Info}     Query info object with `changes` and `lastInsertRowid` properties
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
   * Get the ID of the teamwork test associated with a Discord message ID
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
   * Sum the dice of all helpers for a test, found using the snowflake of a message
   *
   * @param  {Snowflake} message_uid Discord ID of the message
   * @return {int}                   Total number of dice to roll
   */
  getFinalSumByMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT SUM(h.dice) as total
      FROM   interactive.teamwork_helpers AS h
             JOIN interactive.teamwork_messages as m
               ON h.teamwork_id = m.teamwork_id
      WHERE  m.message_uid = ?
    `)
    select.pluck()

    const raw_out = select.get(message_uid)

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

/**
 * Class to manage met-opposed state tracking
 */
class Opposed {
  /**
   * Database object
   * @type Database
   */
  db

  static TestState = {
    Fresh: 0,
    Bidding: 1,
    Done: 2,
  }

  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Add an opposed challenge
   *
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addChallenge({ locale, attacker_uid, attribute, description = "", retests_allowed, retest_ability, conditions = [], ties, channel_uid, timeout } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.opposed_challenges (
        locale,
        attacker_uid,
        attribute,
        description,
        retests_allowed,
        retest_ability,
        conditions,
        ties,
        channel_uid,
        expires_at
      ) VALUES (
        @locale,
        @attacker_uid,
        @attribute,
        @description,
        @retests_allowed,
        @retest_ability,
        JSONB(@conditions),
        @ties,
        @channel_uid,
        datetime('now', @timeout || ' seconds')
      )
    `)

    return insert.run({
      locale,
      attacker_uid,
      attribute,
      description,
      retests_allowed: +!!retests_allowed,
      retest_ability,
      conditions: JSON.stringify(conditions),
      ties,
      channel_uid,
      timeout,
    })
  }

  /**
   * Remove an opposed challenge
   *
   * @param  {int} id Internal ID of the challenge record
   * @return {Info}   Query info object with `changes` and `lastInsertRowid` properties
   */
  destroy(id) {
    const destroy = this.db.prepare(oneLine`
      DELETE FROM interactive.opposed_challenges WHERE id = ?
    `)
    return destroy.run(id)
  }

  getChallenge(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT   *,
               JSON_EXTRACT(conditions, '$') as conditions,
               TIME('now') > TIME(expires_at) AS expired
      FROM     interactive.opposed_challenges
      WHERE    id = ?
    `)

    const raw_out = select.get(challenge_id)

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      conditions: JSON.parse(raw_out.conditions),
      expired: !!raw_out.expired,
    }
  }

  getTiedResult(test_id) {
    const select = this.db.prepare(oneLine`
      SELECT ties
      FROM   interactive.opposed_challenges AS c
             JOIN interactive.opposed_tests AS t
               ON c.id = t.challenge_id
      WHERE  t.id = ?
    `)
    select.pluck()

    return select.get(test_id)
  }

  addMessage({ message_uid, challenge_id, test_id = null} = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.opposed_messages (
        message_uid,
        challenge_id,
        test_id
      ) VALUES (
        @message_uid,
        @challenge_id,
        @test_id
      )
    `)

    return insert.run({
      message_uid,
      challenge_id,
      test_id,
    })
  }

  findChallengeByMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT c.*,
             JSON_EXTRACT(c.conditions, '$') as conditions,
             TIME('now') > TIME(c.expires_at) AS expired
      FROM   interactive.opposed_challenges AS c
             JOIN interactive.opposed_messages AS m
               ON c.id = m.challenge_id
      WHERE  m.message_uid = @message_uid
    `)

    const raw_out = select.get({
      message_uid,
    })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      conditions: JSON.parse(raw_out.conditions),
      retests_allowed: !!raw_out.retests_allowed,
      expired: !!raw_out.expired,
    }
  }

  findChallengeByTest(test_id) {
    const select = this.db.prepare(oneLine`
      SELECT c.*,
             JSON_EXTRACT(c.conditions, '$') as conditions,
             TIME('now') > TIME(c.expires_at) AS expired
      FROM   interactive.opposed_challenges AS c
             JOIN interactive.opposed_tests AS t
               ON c.id = t.challenge_id
      WHERE  t.id = ?
    `)

    const raw_out = select.get(test_id)

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      conditions: JSON.parse(raw_out.conditions),
      retests_allowed: !!raw_out.retests_allowed,
      expired: !!raw_out.expired,
    }
  }

  addParticipant({ user_uid, mention, advantages = [], role, challenge_id } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.opposed_participants (
        user_uid,
        mention,
        advantages,
        role,
        challenge_id
      ) VALUES (
        @user_uid,
        @mention,
        JSONB(@advantages),
        @role,
        @challenge_id
      )
    `)

    return insert.run({
      user_uid,
      mention,
      advantages: JSON.stringify(advantages),
      role,
      challenge_id,
    })
  }

  participantCount(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT count(1)
      FROM interactive.opposed_participants
      WHERE challenge_id = ?
    `)
    select.pluck()

    return select.get(challenge_id)
  }

  getParticipant(participant_id) {
    const select = this.db.prepare(oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') as advantages
      FROM     interactive.opposed_participants
      WHERE    id = ?
    `)

    const raw_out = select.get(participant_id)

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      advantages: JSON.parse(raw_out.advantages),
    }
  }

  getParticipants(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') as advantages
      FROM     interactive.opposed_participants
      WHERE    challenge_id = ?
      ORDER BY role ASC
    `)

    const raw_out = select.all(challenge_id)

    if (raw_out === undefined) return undefined

    raw_out.forEach(p => p.advantages = JSON.parse(p.advantages))

    return new Collection([
      ["attacker", raw_out[0]],
      ["defender", raw_out[1]],
    ])
  }

  updateParticipant(participant_id, advantages) {
    const update = this.db.prepare(oneLine`
      UPDATE opposed_participants
      SET (advantages) = (JSONB(@advantages))
      WHERE id = @id
    `)

    return update.run({
      id: participant_id,
      advantages: JSON.stringify(advantages),
    })
  }

  getPromptUid(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT message_uid
      FROM   interactive.opposed_messages
      WHERE  challenge_id = ?
        AND  test_id IS NULL
    `)
    select.pluck()

    return select.get(challenge_id)
  }

  addTest({
    challenge_id,
    retester_uid = null,
    retest_reason = null,
    canceller_uid = null,
    cancelled_with = null,
    attacker_ready = false,
    defender_ready = false,
    state = 0,
    history = null,
    breakdown = null,
    leader = null,
  } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO opposed_tests (
        challenge_id,
        retester_uid,
        retest_reason,
        canceller_uid,
        cancelled_with,
        state,
        history,
        breakdown,
        leader
      ) VALUES (
        @challenge_id,
        @retester_uid,
        @retest_reason,
        @canceller_uid,
        @cancelled_with,
        @state,
        @history,
        @breakdown,
        @leader
      )
    `)

    return insert.run({
      challenge_id,
      retester_uid,
      retest_reason,
      canceller_uid,
      cancelled_with,
      state,
      history,
      breakdown,
      leader,
    })
  }

  /**
   * Get the individual RPS test associated with a Discord message ID
   *
   * @param  {Snowflake} message_uid Discord ID of the message
   * @return {int}                   Internal ID of the associated RPS test
   */
  findTestByMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT t.*
      FROM   interactive.opposed_tests AS t
             JOIN interactive.opposed_messages AS m
               ON t.id = m.test_id
      WHERE  m.message_uid = @message_uid
    `)

    return select.get({
      message_uid,
    })
  }

  setTestBreakdown(test_id, breakdown) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_tests
      SET (breakdown) = (@breakdown)
      WHERE id = @id
    `)

    return update.run({
      id: test_id,
      breakdown,
    })
  }

  setTestState(test_id, state) {
    if (!Object.values(Opposed.TestState).includes(state)) {
      throw new Error(`invalid state "${state}". Value must appear in Opposed.TestState`)
    }

    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_tests
      SET    state = @state
      WHERE  id = @id
    `)

    return update.run({
      id: test_id,
      state,
    })
  }

  getTestTies(test_id) {
    const select = this.db.prepare(oneLine`
      SELECT ties
      FROM   interactive.opposed_challenges AS c
             JOIN interactive.opposed_tests AS T
               ON t.id = c.challenge_id
      WHERE t.id = ?
    `)
    select.pluck()

    return select.get(test_id)
  }

  addChopRequest({request, test_id, participant_id}) {
    const upsert = this.db.prepare(oneLine`
      INSERT INTO interactive.opposed_test_chops (
        request,
        test_id,
        participant_id
      )
      VALUES (
        @request,
        @test_id,
        @participant_id
      )
      ON CONFLICT (test_id, participant_id) DO
      UPDATE SET
        request = excluded.request
    `)

    return upsert.run({
      request,
      test_id,
      participant_id,
    })
  }

  getChopsForTest(test_id) {
    const select = this.db.prepare(oneLine`
      SELECT * FROM interactive.opposed_test_chops
      WHERE test_id = ?
    `)

    const raw_out = select.all(test_id)

    if (raw_out === undefined) return [undefined]

    raw_out.forEach(t => t.ready = !!t.ready)

    return raw_out
  }

  setChopReady(chop_id, ready) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_test_chops
      SET (ready) = (@ready)
      WHERE id = @id
    `)

    return update.run({
      id: chop_id,
      ready: +!!ready,
    })
  }

  setChopResult(chop_id, result) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_test_chops
      SET (result) = (@result)
      WHERE id = @id
    `)

    return update.run({
      id: chop_id,
      result,
    })
  }
}

module.exports = {
  MessageType,
  Teamwork,
  ParticipantRoles,
  Opposed,
}
