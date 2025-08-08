const { Collection } = require("discord.js")
const { oneLine } = require("common-tags")

const { CachedDb } = require("./cached-db")
const { Challenge } = require("./opposed/challenge")
const { Participant } = require("./opposed/participant")
const { OpTest } = require("./opposed/optest")

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
    const select = this.prepared(
      "challengeCount",
      oneLine`
      SELECT count(1)
      FROM   interactive.opposed_challenges
    `,
      true,
    )

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

    return new Challenge(raw_out)
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

    const sanitized = new Challenge(raw_out)
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

  setChallengeExpired(challenge_id) {
    const update = this.prepared(
      "setChallengeExpired",
      oneLine`
      UPDATE interactive.opposed_challenges
      SET    expires_at = datetime('now', '-1000 seconds')
      WHERE  id = ?
    `,
    )

    return update.run(challenge_id)
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

    return new Challenge(raw_out)
  }

  /**
   * Get whether the challenge associated with a given message is finalized
   * @param  {Snowflake} message_uid Discord ID of the message to look up
   * @return {boolean}               True if the message's state is in Challenge.FinalStates, false if not
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
          AND  c.state IN (${Challenge.FinalStatesExpr})
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

    return new Challenge(raw_out)
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

  /**
   * Get the message record for a given ID
   * @param  {int}    message_id Internal ID of the message
   * @return {object}            Message object or undefined if not found
   */
  getMessage(message_id) {
    const select = this.prepared(
      "getMessage",
      oneLine`
      SELECT *
      FROM   interactive.opposed_messages
      WHERE  id = ?
    `,
    )

    return select.get(message_id)
  }

  getChallengeMessages(challenge_id) {
    const select = this.prepared(
      "getChallengeMessages",
      oneLine`
      SELECT *
      FROM   interactive.opposed_messages
      WHERE  challenge_id = ?
    `,
    )

    return select.all(challenge_id)
  }

  /**
   * Get whether a message UID is stored
   * @param  {Snowflake}  message_uid Discord message ID
   * @return {Boolean}                True if the message is stored, false if not
   */
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

  /**
   * Get whether a message UID matches its challenge's most recent test
   * @param  {Snowflake} message_uid Discord ID of the message
   * @return {boolean}               True if the message is stored and references the most recent test of its challenge. False otherwise.
   */
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

  /**
   * Add a new participant record
   *
   * @param {options}
   * @param {Snowflake} options.user_uid     Discord ID of the participating user
   * @param {string}    options.mention      Mention string for including in messages
   * @param {string[]}  options.advantages   List of advantage keywords
   * @param {boolean}   options.tie_winner   Whether this participant wins ties against its partner
   * @param {boolean}   options.ability_used Whether this participant has used an ability on the current challenge
   * @param {int}       options.role         Role identifier for attacker or defender
   * @param {int}       options.challenge_id Internal ID of the challenge they're participating in
   * @return {Info} Info object
   */
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

  /**
   * Get the total number of participants in a challenge
   * @param  {int} challenge_id Internal ID of the challenge
   * @return {int}              Number of related participant records
   */
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

  /**
   * Get a single participant record
   * @param  {int}    participant_id Internal ID to look up
   * @return {object}                Participant object, or undefined if the ID is not found
   */
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

    return new Participant(raw_out)
  }

  /**
   * Get the participants for a challenge
   * @param  {int}     challenge_id Internal ID of the challenge
   * @param  {boolean} index_by_id  Whether to index the results by participant role name, or by internal ID
   * @return {Collection<string | int, Participant>} Collection of participants
   */
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

    const participants = raw_out.map((p) => new Participant(p))

    if (index_by_id) {
      return new Collection([
        [participants[0].id, participants[0]],
        [participants[1].id, participants[1]],
      ])
    }

    return new Collection([
      ["attacker", participants[0]],
      ["defender", participants[1]],
    ])
  }

  /**
   * Update the advantages for a participant
   * @param {int} participant_id  Internal ID of the participant record to update
   * @param {string[]} advantages Array of advantage keywords to store
   */
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

  /**
   * Update the ability_used flag for a participant record
   * @param {int}     participant_id Internal ID of the participant record
   * @param {boolean} used           Value of the flag. Defaults to true.
   */
  setParticipantAbilityUsed(participant_id, used = true) {
    if (!participant_id) return false

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

  /**
   * Update the tie_winner flag for a participant record
   * @param {in}      participant_id Internal ID of the participant record
   * @param {boolean} winner         Value of the flag. Defaults to true.
   */
  setTieWinner(participant_id, winner = true) {
    if (!participant_id) return false

    const update = this.prepared(
      "setTieWinner",
      oneLine`
      UPDATE interactive.opposed_participants
      SET    tie_winner = @tie_winner
      WHERE  id = @id
    `,
    )

    return update.run({
      id: participant_id,
      tie_winner: +!!winner,
    })
  }

  /**
   * Get the participant who wins ties for a challenge
   * @param  {int}         challenge_id Internal challenge ID
   * @return {Participant}              Winning participant record, or null
   */
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

    return new Participant(raw_out)
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
      retested: +!!retested,
      canceller_id,
      cancelled_with,
      cancelled: +!!cancelled,
      history,
      breakdown,
      leader_id,
    })
  }

  addFutureTest({ challenge_id, locale, leader_id = null, history = null, gap = 1 } = {}) {
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
   * @return {OpTest}                Test object
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

  getChop(chop_id) {
    const select = this.prepared(
      "getChop",
      oneLine`
        SELECT * FROM interactive.opposed_test_chops
        WHERE id = ?
      `,
    )

    const raw_out = select.get(chop_id)

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      ready: !!raw_out.ready,
      accepted: !!raw_out.accepted,
    }
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
  Opposed,
}
