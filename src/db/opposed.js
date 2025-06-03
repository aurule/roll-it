const { Collection } = require("discord.js")

const { oneLine } = require("common-tags")

const ParticipantRoles = {
  Attacker: 1,
  Defender: 2,
}

const ChallengeStates = {
  Advantages: "advantages",
  Relented: "relented",
  Withdrawn: "withdrawn",
  Throwing: "throwing",
  Bidding: "bidding",
  Winning: "winning",
  Tying: "tying",
  Conceded: "conceded",
  Accepted: "accepted",
  Cancelling: "cancelling",
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
  addChallenge({ locale, attacker_uid, attribute, description = "", retests_allowed, retest_ability, conditions = [], ties, state, channel_uid, timeout } = {}) {
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
        state,
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
        @state,
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
      state,
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

    // if it's truthy, return the matching participant record

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

  hasMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT 1 FROM interactive.opposed_messages
      WHERE message_uid = ?
    `)
    select.pluck()

    return !!select.get(message_uid)
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
  ParticipantRoles,
  Opposed,
}
