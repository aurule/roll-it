const { Collection } = require("discord.js")
const { oneLine } = require("common-tags")

const { CachedDb } = require("./cached-db")
const { OpTest } = require("./opposed/optest")

/**
 * Enum of valid participant role codes
 * @type {Record<string, int>}
 */
const ParticipantRoles = Object.freeze({
  Attacker: 1,
  Defender: 2,
})

/**
 * Enum of valid challenge states
 * @type {Record<string, string>}
 */
const ChallengeStates = Object.freeze({
  AdvantagesAttacker: "advantages-attacker",
  AdvantagesDefender: "advantages-defender",
  Relented: "relented",
  Withdrawn: "withdrawn",
  Throwing: "throwing",
  BiddingAttacker: "bidding-attacker",
  BiddingDefender: "bidding-defender",
  Winning: "winning",
  Tying: "tying",
  Conceded: "conceded",
  Accepted: "accepted",
  Cancelling: "cancelling",
  Expired: "expired",
})

/**
 * Set of states which are considered final
 * @type {Set<string>}
 */
const FINAL_STATES = Object.freeze(
  new Set(["relented", "withdrawn", "conceded", "accepted", "expired"]),
)
/**
 * Database expression for use in a `WHERE state IN` clause
 *
 * @see Opposed.challengeFromMessageIsFinalized
 * @type {string}
 */
const final_states_expr = Object.freeze(
  Array.from(FINAL_STATES)
    .map((s) => `'${s}'`)
    .join(","),
)

/**
 * Turn challenge fields into a standardized js object
 *
 * This decodes the json of `conditions` and converts `expired` from an int to a bool.
 *
 * @param  {object} raw_output Raw SQLite query output containing a challenge record
 * @return {object}            Sanitized challenge record object
 */
function sanitizeChallenge(raw_output) {
  return {
    ...raw_output,
    conditions: JSON.parse(raw_output.conditions),
    expired: !!raw_output.expired,
  }
}

/**
 * Class to manage met-opposed state tracking
 */
class Opposed extends CachedDb {
  /**
   * Create a new opposed challenge record
   *
   * @param  {object}   options
   * @param  {string}   options.locale         Locale code
   * @param  {string}   options.attacker_uid   Discord ID of the initiating user
   * @param  {string}   options.attribute      Name of the attribute related to the test
   * @param  {string}   options.description    Description given for the challenge
   * @param  {string}   options.retest_ability Name of the ability for retests
   * @param  {string[]} options.conditions     List of condition keywords
   * @param  {string}   options.summary        Generated summary of the challenge
   * @param  {string}   options.state          State of the challenge
   * @param  {string}   options.channel_uid    Discord ID of the channel where the challenge was initiated
   * @param  {int}      options.timeout        Number of seconds until the challenge expires
   * @return {Info}     Query info object with `changes` and `lastInsertRowid` properties
   */
  addChallenge({
    locale,
    attacker_uid,
    attribute,
    description = "",
    retest_ability,
    conditions = [],
    summary,
    state,
    channel_uid,
    timeout,
  } = {}) {
    const insert = this.prepared(
      "addChallenge",
      oneLine`
      INSERT INTO interactive.opposed_challenges (
        locale,
        attacker_uid,
        attribute,
        description,
        retest_ability,
        conditions,
        summary,
        state,
        channel_uid,
        expires_at
      ) VALUES (
        @locale,
        @attacker_uid,
        @attribute,
        @description,
        @retest_ability,
        JSONB(@conditions),
        @summary,
        @state,
        @channel_uid,
        datetime('now', @timeout || ' seconds')
      )
    `,
    )

    return insert.run({
      locale,
      attacker_uid,
      attribute,
      description,
      retest_ability,
      conditions: JSON.stringify(conditions),
      summary,
      state,
      channel_uid,
      timeout,
    })
  }

  /**
   * Get a total number of challenge records
   * @return {int} Number of challenge records
   */
  challengeCount() {
    const select = this.prepared("challengeCount", oneLine`
      SELECT count(1)
      FROM   interactive.opposed_challenges
    `, true)

    return select.get()
  }

  /**
   * Remove an opposed challenge
   *
   * @param  {int} id Internal ID of the challenge record
   * @return {Info}   Query info object with `changes` and `lastInsertRowid` properties
   */
  destroy(id) {
    const destroy = this.prepared(
      "destroy",
      oneLine`
      DELETE FROM interactive.opposed_challenges WHERE id = ?
    `,
    )
    return destroy.run(id)
  }

  /**
   * Get the details of a challenge
   * @param  {int} challenge_id Internal ID of the challenge record
   * @return {Challenge}        Full challenge record
   */
  getChallenge(challenge_id) {
    const select = this.prepared(
      "getChallenge",
      oneLine`
      SELECT   *,
               JSON_EXTRACT(conditions, '$') AS conditions,
               TIME('now') > TIME(expires_at) AS expired
      FROM     interactive.opposed_challenges
      WHERE    id = ?
    `,
    )

    const raw_out = select.get(challenge_id)

    if (raw_out === undefined) return undefined

    return sanitizeChallenge(raw_out)
  }

  /**
   * Get a challenge record with associated participant records
   * @param  {int} challenge_id Internal ID of the challenge record
   * @return {Challenge}        Full challenge record with attacker and defender records
   */
  getChallengeWithParticipants(challenge_id) {
    const select = this.prepared(
      "getChallengeWithParticipants",
      oneLine`
      SELECT   *,
               JSON_EXTRACT(conditions, '$') AS conditions,
               TIME('now') > TIME(expires_at) AS expired
      FROM     interactive.opposed_challenges
      WHERE    id = ?
    `,
    )

    const raw_out = select.get(challenge_id)

    if (raw_out === undefined) return undefined

    const participants = this.getParticipants(challenge_id)

    const sanitized = sanitizeChallenge(raw_out)
    return {
      ...sanitized,
      attacker: participants.get("attacker"),
      defender: participants.get("defender"),
    }
  }

  /**
   * Update the state of a challenge
   *
   * @param {int}    challenge_id Internal ID of the challenge record
   * @param {string} state        State string. Must be from `ChallengeStates`
   */
  setChallengeState(challenge_id, state) {
    const update = this.prepared(
      "setChallengeState",
      oneLine`
      UPDATE interactive.opposed_challenges
      SET    state = @state
      WHERE  id = @id
    `,
    )

    return update.run({
      id: challenge_id,
      state,
    })
  }

  /**
   * Update the summary of the challenge
   * @param {int}    challenge_id Internal ID of the challenge record
   * @param {string} summary      New summary string
   */
  setChallengeSummary(challenge_id, summary) {
    const update = this.prepared(
      "setChallengeSummary",
      oneLine`
      UPDATE interactive.opposed_challenges
      SET    summary = @summary
      WHERE  id = @id
    `,
    )

    return update.run({
      id: challenge_id,
      summary,
    })
  }

  /**
   * Update the conditions of the challenge
   * @param {int}      challenge_id Internal ID of the challenge record
   * @param {string[]} conditions   Array of new condition keywords
   */
  setChallengeConditions(challenge_id, conditions) {
    const update = this.prepared(
      "setChallengeConditions",
      oneLine`
      UPDATE interactive.opposed_challenges
      SET    conditions = JSONB(@conditions)
      WHERE  id = @id
    `,
    )

    return update.run({
      id: challenge_id,
      conditions: JSON.stringify(conditions),
    })
  }

  /**
   * Get the challenge record associated with a discord message
   * @param  {Snowflake} message_uid Discord ID of the message to look up
   * @return {Challenge}             Challenge record associated with that message
   */
  findChallengeByMessage(message_uid) {
    const select = this.prepared(
      "findChallengeByMessage",
      oneLine`
      SELECT c.*,
             JSON_EXTRACT(c.conditions, '$') AS conditions,
             TIME('now') > TIME(c.expires_at) AS expired
      FROM   interactive.opposed_challenges AS c
             JOIN interactive.opposed_messages AS m
               ON c.id = m.challenge_id
      WHERE  m.message_uid = ?
    `,
    )

    const raw_out = select.get(message_uid)

    if (raw_out === undefined) return undefined

    return sanitizeChallenge(raw_out)
  }

  /**
   * Get whether the challenge associated with a given message is finalized
   * @param  {Snowflake} message_uid Discord ID of the message to look up
   * @return {boolean}               True if the message's state is in FINAL_STATES, false if not
   */
  challengeFromMessageIsFinalized(message_uid) {
    const select = this.prepared(
      "challengeFromMessageIsFinalized",
      oneLine`
        SELECT 1
        FROM   interactive.opposed_challenges AS c
               JOIN interactive.opposed_messages AS m
                 ON c.id = m.challenge_id
        WHERE  m.message_uid = ?
          AND  c.state IN (${final_states_expr})
      `,
      true,
    )

    return !!select.get(message_uid)
  }

  /**
   * Get whether the challenge associated with a message has expired
   * @param  {Snowflake} message_uid Discord ID of the message to use for lookup
   * @return {boolean}               True if the associated challenge is expired, false if not
   */
  challengeFromMessageIsExpired(message_uid) {
    const select = this.prepared(
      "challengeFromMessageIsExpired",
      oneLine`
        SELECT 1
        FROM   interactive.opposed_challenges AS c
               JOIN interactive.opposed_messages AS m
                 ON c.id = m.challenge_id
        WHERE  m.message_uid = ?
          AND  TIME('now') >= TIME(c.expires_at)
      `,
      true,
    )

    return !!select.get(message_uid)
  }

  /**
   * Get the challenge record associated with a given test record
   * @param  {int}       test_id Internal ID of the test record to look up
   * @return {Challenge}         Challenge record
   */
  findChallengeByTest(test_id) {
    const select = this.prepared(
      "findChallengeByTest",
      oneLine`
      SELECT c.*,
             JSON_EXTRACT(c.conditions, '$') AS conditions,
             TIME('now') > TIME(c.expires_at) AS expired
      FROM   interactive.opposed_challenges AS c
             JOIN interactive.opposed_tests AS t
               ON c.id = t.challenge_id
      WHERE  t.id = ?
    `,
    )

    const raw_out = select.get(test_id)

    if (raw_out === undefined) return undefined

    return sanitizeChallenge(raw_out)
  }

  /**
   * Get all test history strings for a challenge
   * @param  {int}      challenge_id Internal ID of the challenge to look up
   * @return {string[]}              Array of history strings for all tests associated with that challenge
   */
  getChallengeHistory(challenge_id) {
    const select = this.prepared(
      "getChallengeHistory",
      oneLine`
        SELECT   history
        FROM     interactive.opposed_tests
        WHERE    challenge_id = ?
        ORDER BY created_at ASC
      `,
      true,
    )

    return select.all(challenge_id)
  }

  /**
   * Add a new message record
   *
   * @param  {object}    options
   * @param  {Snowflake} options.message_uid  Discord ID of the message
   * @param  {int}       options.challenge_id Internal ID of the associated challenge
   * @param  {int?}      options.test_id      Internal ID of the associated test
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addMessage({ message_uid, challenge_id, test_id = null } = {}) {
    const insert = this.prepared(
      "addMessage",
      oneLine`
      INSERT INTO interactive.opposed_messages (
        message_uid,
        challenge_id,
        test_id
      ) VALUES (
        @message_uid,
        @challenge_id,
        @test_id
      )
    `,
    )

    return insert.run({
      message_uid,
      challenge_id,
      test_id,
    })
  }

  getMessage(message_id) {
    const select = this.prepared("getMessage", oneLine`
      SELECT *
      FROM   interactive.opposed_messages
      WHERE  id = ?
    `)

    return select.get(message_id)
  }

  hasMessage(message_uid) {
    const select = this.prepared(
      "hasMessage",
      oneLine`
        SELECT 1 FROM interactive.opposed_messages
        WHERE message_uid = ?
      `,
      true,
    )

    return !!select.get(message_uid)
  }

  messageIsForLatestTest(message_uid) {
    const message_select = this.prepared(
      "messageIsForLatestTest-message",
      oneLine`
        SELECT test_id, challenge_id FROM interactive.opposed_messages
        WHERE message_uid = ?
      `,
    )

    const message_result = message_select.get(message_uid)

    if (!message_result.test_id) return true

    const test_select = this.prepared(
      "messageIsForLatestTest-test",
      oneLine`
        SELECT   id
        FROM     interactive.opposed_tests
        WHERE    challenge_id = ?
        ORDER BY created_at DESC
        LIMIT    1
      `,
      true,
    )

    const test_result = test_select.get(message_result.challenge_id)

    return test_result === message_result.test_id
  }

  addParticipant({
    user_uid,
    mention,
    advantages = [],
    tie_winner = false,
    ability_used = false,
    role,
    challenge_id,
  } = {}) {
    const insert = this.prepared(
      "addParticipant",
      oneLine`
      INSERT INTO interactive.opposed_participants (
        user_uid,
        mention,
        advantages,
        tie_winner,
        ability_used,
        role,
        challenge_id
      ) VALUES (
        @user_uid,
        @mention,
        JSONB(@advantages),
        @tie_winner,
        @ability_used,
        @role,
        @challenge_id
      )
    `,
    )

    return insert.run({
      user_uid,
      mention,
      advantages: JSON.stringify(advantages),
      tie_winner: +!!tie_winner,
      ability_used: +!!ability_used,
      role,
      challenge_id,
    })
  }

  participantCount(challenge_id) {
    const select = this.prepared(
      "participantCount",
      oneLine`
        SELECT count(1)
        FROM interactive.opposed_participants
        WHERE challenge_id = ?
      `,
      true,
    )

    return select.get(challenge_id)
  }

  getParticipant(participant_id) {
    const select = this.prepared(
      "getParticipant",
      oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') AS advantages
      FROM     interactive.opposed_participants
      WHERE    id = ?
    `,
    )

    const raw_out = select.get(participant_id)

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      advantages: JSON.parse(raw_out.advantages),
      tie_winner: !!raw_out.tie_winner,
      ability_used: !!raw_out.ability_used,
    }
  }

  getParticipants(challenge_id, index_by_id = false) {
    const select = this.prepared(
      "getParticipants",
      oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') AS advantages
      FROM     interactive.opposed_participants
      WHERE    challenge_id = ?
      ORDER BY role ASC
    `,
    )

    const raw_out = select.all(challenge_id)

    if (raw_out === undefined) return undefined

    raw_out.forEach((p) => {
      p.advantages = JSON.parse(p.advantages)
      p.tie_winner = !!p.tie_winner
      p.ability_used = !!p.ability_used
    })

    if (index_by_id) {
      return new Collection([
        [raw_out[0].id, raw_out[0]],
        [raw_out[1].id, raw_out[1]],
      ])
    }

    return new Collection([
      ["attacker", raw_out[0]],
      ["defender", raw_out[1]],
    ])
  }

  setParticipantAdvantages(participant_id, advantages) {
    const update = this.prepared(
      "setParticipantAdvantages",
      oneLine`
      UPDATE opposed_participants
      SET advantages = JSONB(@advantages)
      WHERE id = @id
    `,
    )

    return update.run({
      id: participant_id,
      advantages: JSON.stringify(advantages),
    })
  }

  setParticipantAbilityUsed(participant_id, used = true) {
    const update = this.prepared(
      "setParticipantAbilityUsed",
      oneLine`
      UPDATE interactive.opposed_participants
      SET    ability_used = @used
      WHERE  id = @id
    `,
    )

    return update.run({
      id: participant_id,
      used: +!!used,
    })
  }

  setTieWinner(participant_id) {
    if (!participant_id) return false

    const update = this.prepared(
      "setTieWinner",
      oneLine`
      UPDATE interactive.opposed_participants
      SET    tie_winner = 1
      WHERE  id = ?
    `,
    )

    return update.run(participant_id)
  }

  getTieWinner(challenge_id) {
    const select = this.prepared(
      "getTieWinner",
      oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') AS advantages
      FROM     interactive.opposed_participants
      WHERE    challenge_id = ?
               AND tie_winner = 1
    `,
    )

    const raw_out = select.get(challenge_id)

    if (raw_out === undefined) return null

    return {
      ...raw_out,
      advantages: JSON.parse(raw_out.advantages),
      tie_winner: !!raw_out.tie_winner,
      ability_used: !!raw_out.ability_used,
    }
  }

  addTest({
    challenge_id,
    locale,
    retester_id = null,
    retest_reason = null,
    retested = false,
    canceller_id = null,
    cancelled_with = null,
    cancelled = false,
    history = null,
    breakdown = null,
    leader_id = null,
  } = {}) {
    const insert = this.prepared(
      "addTest",
      oneLine`
      INSERT INTO opposed_tests (
        challenge_id,
        locale,
        retester_id,
        retest_reason,
        retested,
        canceller_id,
        cancelled_with,
        cancelled,
        history,
        breakdown,
        leader_id
      ) VALUES (
        @challenge_id,
        @locale,
        @retester_id,
        @retest_reason,
        @retested,
        @canceller_id,
        @cancelled_with,
        @cancelled,
        @history,
        @breakdown,
        @leader_id
      )
    `,
    )

    return insert.run({
      challenge_id,
      locale,
      retester_id,
      retest_reason,
      retested: +!!cancelled,
      canceller_id,
      cancelled_with,
      cancelled: +!!cancelled,
      history,
      breakdown,
      leader_id,
    })
  }

  addFutureTest({
    challenge_id,
    locale,
    leader_id = null,
    history = null,
    gap = 1,
  } = {}) {
    const insert = this.prepared(
      "addFutureTest",
      oneLine`
      INSERT INTO opposed_tests (
        challenge_id,
        locale,
        leader_id,
        history,
        created_at
      ) VALUES (
        @challenge_id,
        @locale,
        @leader_id,
        @history,
        datetime('now', @gap || ' seconds')
      )
    `,
    )

    return insert.run({
      challenge_id,
      locale,
      leader_id,
      history,
      gap,
    })
  }

  getTest(test_id) {
    const select = this.prepared(
      "getTest",
      oneLine`
      SELECT *
      FROM   interactive.opposed_tests
      WHERE  id = ?
    `,
    )

    const result = select.get(test_id)
    return new OpTest({ ...result, opposed_db: this })
  }

  /**
   * Get the individual RPS test associated with a Discord message ID
   *
   * @param  {Snowflake} message_uid Discord ID of the message
   * @return {int}                   Internal ID of the associated RPS test
   */
  findTestByMessage(message_uid) {
    const select = this.prepared(
      "findTestByMessage",
      oneLine`
      SELECT t.*
      FROM   interactive.opposed_tests AS t
             JOIN interactive.opposed_messages AS m
               ON t.id = m.test_id
      WHERE  m.message_uid = ?
    `,
    )

    const result = select.get(message_uid)

    return new OpTest({ ...result, opposed_db: this })
  }

  getLatestTest(challenge_id) {
    const test_select = this.prepared(
      "getLatestTest",
      oneLine`
      SELECT   *
      FROM     interactive.opposed_tests
      WHERE    challenge_id = ?
      ORDER BY created_at DESC
      LIMIT    1
    `,
    )
    const result = test_select.get(challenge_id)

    return new OpTest({ ...result, opposed_db: this })
  }

  getLatestTestWithParticipants(challenge_id) {
    const test_select = this.prepared(
      "getLatestTestWithParticipants",
      oneLine`
      SELECT   *
      FROM     interactive.opposed_tests
      WHERE    challenge_id = ?
      ORDER BY created_at DESC
      LIMIT    1
    `,
    )
    const result = test_select.get(challenge_id)

    const test = new OpTest({ ...result, opposed_db: this })
    test.populateParticipants()

    return test
  }

  setTestRetested(test_id, retested = true) {
    const update = this.prepared(
      "setTestRetested",
      oneLine`
      UPDATE interactive.opposed_tests
      SET retested = @retested
      WHERE id = @id
    `,
    )

    return update.run({
      id: test_id,
      retested: +!!retested,
    })
  }

  setTestCancelledWith(test_id, reason) {
    const update = this.prepared(
      "setTestCancelledWith",
      oneLine`
      UPDATE interactive.opposed_tests
      SET cancelled_with = @cancelled_with
      WHERE id = @id
    `,
    )

    return update.run({
      id: test_id,
      cancelled_with: reason,
    })
  }

  setTestCancelled(test_id) {
    const update = this.prepared(
      "setTestCancelled",
      oneLine`
      UPDATE interactive.opposed_tests
      SET cancelled = 1
      WHERE id = ?
    `,
    )

    return update.run(test_id)
  }

  setTestLeader(test_id, leader_id) {
    const update = this.prepared(
      "setTestLeader",
      oneLine`
      UPDATE interactive.opposed_tests
      SET leader_id = @leader_id
      WHERE id = @id
    `,
    )

    return update.run({
      id: test_id,
      leader_id,
    })
  }

  setTestBreakdown(test_id, breakdown) {
    const update = this.prepared(
      "setTestBreakdown",
      oneLine`
      UPDATE interactive.opposed_tests
      SET breakdown = @breakdown
      WHERE id = @id
    `,
    )

    return update.run({
      id: test_id,
      breakdown,
    })
  }

  setTestHistory(test_id, history) {
    const update = this.prepared(
      "setTestHistory",
      oneLine`
      UPDATE interactive.opposed_tests
      SET history = @history
      WHERE id = @id
    `,
    )

    return update.run({
      id: test_id,
      history,
    })
  }

  setRetest({ test_id, retester_id, reason, canceller_id }) {
    const update = this.prepared(
      "setRetest",
      oneLine`
      UPDATE interactive.opposed_tests
      SET    (retester_id, retest_reason, canceller_id) = (@retester_id, @reason, @canceller_id)
      WHERE  id = @id
    `,
    )

    return update.run({
      id: test_id,
      retester_id,
      reason,
      canceller_id,
    })
  }

  getTestTies(test_id) {
    const select = this.prepared(
      "getTestTies",
      oneLine`
        SELECT ties
        FROM   interactive.opposed_challenges AS c
               JOIN interactive.opposed_tests AS T
                 ON t.id = c.challenge_id
        WHERE t.id = ?
      `,
      true,
    )

    return select.get(test_id)
  }

  addChopRequest({ request, test_id, participant_id }) {
    const upsert = this.prepared(
      "addChopRequest",
      oneLine`
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
    `,
    )

    return upsert.run({
      request,
      test_id,
      participant_id,
    })
  }

  getChopsForTest(test_id) {
    const select = this.prepared(
      "getChopsForTest",
      oneLine`
      SELECT * FROM interactive.opposed_test_chops
      WHERE test_id = ?
    `,
    )

    const raw_out = select.all(test_id)

    if (raw_out === undefined) return [undefined]

    raw_out.forEach((t) => {
      t.ready = !!t.ready
      t.tie_accepted = !!t.tie_accepted
      return t
    })

    return raw_out
  }

  setChopReady(chop_id, ready) {
    const update = this.prepared(
      "setChopReady",
      oneLine`
      UPDATE interactive.opposed_test_chops
      SET ready = @ready
      WHERE id = @id
    `,
    )

    return update.run({
      id: chop_id,
      ready: +!!ready,
    })
  }

  didParticipantChop(participant_id, test_id) {
    const select = this.prepared(
      "didParticipantChop",
      oneLine`
        SELECT 1
        FROM   interactive.opposed_test_chops
        WHERE  test_id = @test_id
               AND participant_id = @participant_id
      `,
      true,
    )

    return !!select.get({
      participant_id,
      test_id,
    })
  }

  setChopResult(chop_id, result) {
    const update = this.prepared(
      "setChopResult",
      oneLine`
      UPDATE interactive.opposed_test_chops
      SET result = @result
      WHERE id = @id
    `,
    )

    return update.run({
      id: chop_id,
      result,
    })
  }

  setChopTraits(chop_id, traits) {
    const update = this.prepared(
      "setChopTraits",
      oneLine`
      UPDATE interactive.opposed_test_chops
      SET traits = @traits
      WHERE id = @id
    `,
    )

    return update.run({
      id: chop_id,
      traits,
    })
  }

  setChopTieAccepted(chop_id, accepted) {
    const update = this.prepared(
      "setChopTieAccepted",
      oneLine`
      UPDATE interactive.opposed_test_chops
      SET tie_accepted = @accepted
      WHERE id = @id
    `,
    )

    return update.run({
      id: chop_id,
      accepted: +!!accepted,
    })
  }
}

module.exports = {
  ParticipantRoles,
  ChallengeStates,
  FINAL_STATES,
  Opposed,
  sanitizeChallenge,
}
