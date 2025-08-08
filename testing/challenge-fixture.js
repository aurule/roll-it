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
  attacker
  defender_uid = "def"
  defender
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
      conditions: [Challenge.Conditions.Normal],
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

  addAttacker() {
    this.attacker = new ParticipantFixture(this, this.attacker_uid, Participant.Roles.Attacker)
    return this.attacker
  }

  addDefender() {
    this.defender = new ParticipantFixture(this, this.defender_uid, Participant.Roles.Defender)
    return this.attacker
  }

  withParticipants() {
    this.addAttacker()
    this.addDefender()

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
      retester_id: this.attacker.id,
      canceller_id: this.defender.id,
      retest_reason: reason,
      retested: true,
    })
  }

  defenderRetest(reason) {
    return this.addTest({
      retester_id: this.defender.id,
      canceller_id: this.attacker.id,
      retest_reason: reason,
      retested: true,
    })
  }

  addAttackerWin() {
    return this.addTest({
      leader_id: this.attacker.id,
      breakdown: "scissors vs paper",
    })
  }

  addDefenderWin() {
    return this.addTest({
      leader_id: this.defender.id,
      breakdown: "rock vs paper",
    })
  }

  addTie() {
    return this.addTest({
      breakdown: "paper vs paper",
    })
  }
}

class ParticipantFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  id
  challenge
  uid

  constructor(challenge, uid, role) {
    this.challenge = challenge
    this.db = challenge.db
    this.uid = uid

    this.id = this.db.addParticipant({
      user_uid: uid,
      mention: `<@${uid}>`,
      role,
      challenge_id: challenge.id,
      advantages: [Participant.Advantages.None],
    }).lastInsertRowid
  }

  get record() {
    return this.db.getParticipant(this.id)
  }

  setAdvantages(advantages) {
    this.db.setParticipantAdvantages(this.id, advantages)
    return this
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
  attacker_chop
  defender_chop

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
    this.attacker_chop = new ChopFixture(request, this, this.challenge.attacker.id)
    return this.attacker_chop
  }

  defenderChop(request) {
    this.defender_chop = new ChopFixture(request, this, this.challenge.defender.id)
    return this.defender_chop
  }
}

class ChopFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  id
  test
  request

  constructor(request, test, participant_id) {
    this.test = test
    this.db = test.db
    this.request = request

    this.id = this.db.addChopRequest({
      request,
      test_id: this.test.id,
      participant_id: participant_id,
    }).lastInsertRowid
  }

  get record() {
    return this.db.getChop(this.id)
  }

  setTraits(traits) {
    this.db.setChopTraits(this.id, traits)
    return this
  }

  ready() {
    this.db.setChopReady(this.id, true)
    return this
  }

  resolve(forced_result) {
    const result = forced_result ?? this.request
    this.db.setChopResult(this.id, result)
    return this
  }

  accept() {
    this.db.setChopTieAccepted(this.id, true)
    return this
  }
}

module.exports = {
  ChallengeFixture,
}
