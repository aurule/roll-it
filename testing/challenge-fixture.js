const { Opposed } = require("../src/db/opposed")
const { Challenge } = require("../src/db/opposed/challenge")
const { Participant } = require("../src/db/opposed/participant")

class ChallengeFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  id
  attacker_uid = "atk"
  attacker_id
  defender_uid = "def"
  defender_id
  tests = []

  constructor(state = Challenge.States.AdvantagesAttacker, db_obj) {
    this.db = new Opposed(db_obj)

    // create the challenge record
    this.id = this.db.addChallenge({
      locale: "en-US",
      attacker_uid: this.attacker_uid,
      attribute: "mental",
      description: "fake challenge",
      retest_ability: "occult",
      conditions: [],
      state,
      channel_uid: "fake_channel",
      timeout: 1000,
    }).lastInsertRowid
  }

  cleanup() {
    return this.db.destroy(this.id)
  }

  get record() {
    return this.db.getChallenge(this.id)
  }

  setSummary(summary) {
    this.db.setChallengeSummary(this.id, summary)
    return this
  }

  expire() {
    this.db.setChallengeExpired(this.id)
    return this
  }

  attacker({ advantages = [], tie_winner = false, ability_used = false } = {}) {
    this.attacker_id = this.db.addParticipant({
      user_uid: this.attacker_uid,
      mention: `<@${this.attacker_uid}>`,
      role: Participant.Roles.Attacker,
      challenge_id: this.id,
      advantages,
      tie_winner,
      ability_used,
    }).lastInsertRowid

    return this
  }

  defender({ advantages = [], tie_winner = false, ability_used = false } = {}) {
    this.defender_id = this.db.addParticipant({
      user_uid: this.defender_uid,
      mention: `<@${this.defender_uid}>`,
      role: Participant.Roles.Defender,
      challenge_id: this.id,
      advantages,
      tie_winner,
      ability_used,
    }).lastInsertRowid

    return this
  }

  withParticipants() {
    this.attacker()
    this.defender()

    return this
  }

  attachMessage(message_uid) {
    this.db.addMessage({
      message_uid,
      challenge_id: this.id,
    })
    return this
  }

  addTest(options = {}) {
    const test = new TestFixture(this, options)
    this.tests.push(test)
    return test
  }

  attackerRetest(reason) {
    return this.addTest({
      retester_id: this.attacker_id,
      canceller_id: this.defender_id,
      retest_reason: reason,
      retested: true,
    })
  }

  defenderRetest(reason) {
    return this.addTest({
      retester_id: this.defender_id,
      canceller_id: this.attacker_id,
      retest_reason: reason,
      retested: true,
    })
  }

  addAttackerWin() {
    return this.addTest({
      leader_id: this.attacker_id,
      breakdown: "scissors vs paper",
    })
  }

  addDefenderWin() {
    return this.addTest({
      leader_id: this.defender_id,
      breakdown: "rock vs paper",
    })
  }

  addTie() {
    return this.addTest({
      breakdown: "paper vs paper",
    })
  }
}

class TestFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  id
  challenge
  attacker_chop_id
  defender_chop_id

  constructor(challenge, options) {
    this.challenge = challenge
    this.db = challenge.db

    this.id = this.db.addTest({
      ...options,
      challenge_id: this.challenge.id,
      locale: "en-US",
    }).lastInsertRowid
  }

  get record() {
    return this.db.getTest(this.id)
  }

  attachMessage(message_uid) {
    this.db.addMessage({
      message_uid,
      challenge_id: this.challenge.id,
      test_id: this.id,
    })
    return this
  }

  attackerChop(request) {
    this.attacker_chop_id = this.db.addChopRequest({
      request,
      test_id: this.id,
      participant_id: this.challenge.attacker_id,
    }).lastInsertRowid
    return this
  }

  defenderChop(request) {
    this.defender_chop_id = this.db.addChopRequest({
      request,
      test_id: this.id,
      participant_id: this.challenge.defender_id,
    }).lastInsertRowid
    return this
  }

  get chops() {
    return this.db.getChopsForTest(this.id)
  }
}

module.exports = {
  ChallengeFixture,
}
