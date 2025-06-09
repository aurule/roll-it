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
  BiddingAttacker: "bidding-attacker",
  BiddingDefender: "bidding-defender",
  Winning: "winning",
  Tying: "tying",
  Conceded: "conceded",
  Accepted: "accepted",
  Cancelling: "cancelling",
  Expired: "expired",
}

const FINAL_STATES = new Set('relented', 'withdrawn', 'conceded', 'accepted', 'expired')

/**
 * Class to manage met-opposed state tracking
 */
class Opposed {
  /**
   * Database object
   * @type Database
   */
  db

  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Add an opposed challenge
   *
   * @return {Info}      Query info object with `changes` and `lastInsertRowid` properties
   */
  addChallenge({ locale, attacker_uid, attribute, description = "", retests_allowed, retest_ability, conditions = [], summary, state, channel_uid, timeout } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO interactive.opposed_challenges (
        locale,
        attacker_uid,
        attribute,
        description,
        retests_allowed,
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
        @retests_allowed,
        @retest_ability,
        JSONB(@conditions),
        @summary,
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
      summary,
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
               JSON_EXTRACT(conditions, '$') AS conditions,
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

  getChallengeWithParticipants(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT   *,
               JSON_EXTRACT(conditions, '$') AS conditions,
               TIME('now') > TIME(expires_at) AS expired
      FROM     interactive.opposed_challenges
      WHERE    id = ?
    `)

    const raw_out = select.get(challenge_id)

    if (raw_out === undefined) return undefined

    const participants = this.getParticipants(challenge_id)

    return {
      ...raw_out,
      conditions: JSON.parse(raw_out.conditions),
      expired: !!raw_out.expired,
      attacker: participants.get("attacker"),
      defender: participants.get("defender"),
    }
  }

  setChallengeState(challenge_id, state) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_challenges
      SET    state = @state
      WHERE  id = @id
    `)

    return update.run({
      id: challenge_id,
      state,
    })
  }

  setChallengeSummary(challenge_id, summary) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_challenges
      SET    summary = @summary
      WHERE  id = @id
    `)

    return update.run({
      id: challenge_id,
      summary,
    })
  }

  findChallengeByMessage(message_uid) {
    const select = this.db.prepare(oneLine`
      SELECT c.*,
             JSON_EXTRACT(c.conditions, '$') AS conditions,
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
             JSON_EXTRACT(c.conditions, '$') AS conditions,
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

  getChallengeHistory(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT   history
      FROM     interactive.opposed_tests
      WHERE    challenge_id = ?
      ORDER BY created_at ASC
    `)
    select.pluck()

    return select.all(challenge_id)
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
               JSON_EXTRACT(advantages, '$') AS advantages
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

  getParticipants(challenge_id, index_by_id = false) {
    const select = this.db.prepare(oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') AS advantages
      FROM     interactive.opposed_participants
      WHERE    challenge_id = ?
      ORDER BY role ASC
    `)

    const raw_out = select.all(challenge_id)

    if (raw_out === undefined) return undefined

    raw_out.forEach(p => p.advantages = JSON.parse(p.advantages))

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
    const update = this.db.prepare(oneLine`
      UPDATE opposed_participants
      SET advantages = JSONB(@advantages)
      WHERE id = @id
    `)

    return update.run({
      id: participant_id,
      advantages: JSON.stringify(advantages),
    })
  }

  setTieWinner(participant_id) {
    if (!participant_id) return false

    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_participants
      SET    tie_winner = 1
      WHERE  id = ?
    `)

    return update.run(participant_id)
  }

  getTieWinner(challenge_id) {
    const select = this.db.prepare(oneLine`
      SELECT   *,
               JSON_EXTRACT(advantages, '$') AS advantages
      FROM     interactive.opposed_participants
      WHERE    challenge_id = ?
               AND tie_winner = 1
    `)

    const raw_out = select.get(challenge_id)

    if (raw_out === undefined) return null

    return {
      ...raw_out,
      advantages: JSON.parse(raw_out.advantages),
    }
  }

  addTest({
    challenge_id,
    locale,
    retester_id = null,
    retest_reason = null,
    canceller_id = null,
    cancelled_with = null,
    attacker_ready = false,
    defender_ready = false,
    history = null,
    breakdown = null,
    leader_id = null,
  } = {}) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO opposed_tests (
        challenge_id,
        locale,
        retester_id,
        retest_reason,
        canceller_id,
        cancelled_with,
        history,
        breakdown,
        leader_id
      ) VALUES (
        @challenge_id,
        @locale,
        @retester_id,
        @retest_reason,
        @canceller_id,
        @cancelled_with,
        @history,
        @breakdown,
        @leader_id
      )
    `)

    return insert.run({
      challenge_id,
      locale,
      retester_id,
      retest_reason,
      canceller_id,
      cancelled_with,
      attacker_ready: +!!attacker_ready,
      defender_ready: +!!defender_ready,
      history,
      breakdown,
      leader_id,
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

  getLatestTestWithParticipants(challenge_id) {
    const test_select = this.db.prepare(oneLine`
      SELECT   *
      FROM     interactive.opposed_tests
      WHERE    challenge_id = ?
      ORDER BY created_at DESC
      LIMIT    1
    `)
    const test = test_select.get(challenge_id)

    const participants = this.getParticipants(challenge_id, true)

    return {
      ...test,
      leader: participants.get(test.leader_id),
      trailer: participants.find(p => p.id != test.leader_id),
      retester: participants.get(test.retester_id),
      canceller: participants.get(test.canceller_id),
    }
  }

  setTestLeader(test_id, leader_id) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_tests
      SET leader_id = @leader_id
      WHERE id = @id
    `)

    return update.run({
      id: test_id,
      leader_id,
    })
  }

  setTestBreakdown(test_id, breakdown) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_tests
      SET breakdown = @breakdown
      WHERE id = @id
    `)

    return update.run({
      id: test_id,
      breakdown,
    })
  }

  setTestHistory(test_id, history) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_tests
      SET history = @history
      WHERE id = @id
    `)

    return update.run({
      id: test_id,
      history,
    })
  }

  setRetest({test_id, retester_id, reason, canceller_id}) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_tests
      SET    (retester_id, retest_reason, canceller_id) = (@retester_id, @reason, @canceller_id)
      WHERE  id = @id
    `)

    return update.run({
      id: test_id,
      retester_id,
      reason,
      canceller_id
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

    raw_out.forEach(t => {
      t.ready = !!t.ready
      t.tie_accepted = !!t.tie_accepted
      return t
    })

    return raw_out
  }

  setChopReady(chop_id, ready) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_test_chops
      SET ready = @ready
      WHERE id = @id
    `)

    return update.run({
      id: chop_id,
      ready: +!!ready,
    })
  }

  didParticipantChop(participant_id, test_id) {
    const select = this.db.prepare(oneLine`
      SELECT 1
      FROM   interactive.opposed_test_chops
      WHERE  test_id = @test_id
             AND participant_id = @participant_id
    `)
    select.pluck()

    return !!select.get({
      participant_id,
      test_id,
    })
  }

  setChopResult(chop_id, result) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_test_chops
      SET result = @result
      WHERE id = @id
    `)

    return update.run({
      id: chop_id,
      result,
    })
  }

  setChopTraits(chop_id, traits) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_test_chops
      SET traits = @traits
      WHERE id = @id
    `)

    return update.run({
      id: chop_id,
      traits,
    })
  }

  setChopTieAccepted(chop_id, accepted) {
    const update = this.db.prepare(oneLine`
      UPDATE interactive.opposed_test_chops
      SET tie_accepted = @accepted
      WHERE id = @id
    `)

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
}
