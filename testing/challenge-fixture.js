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

  attacker({ advantages = [Participant.Advantages.None], tie_winner = false, ability_used = false } = {}) {
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

  defender({ advantages = [Participant.Advantages.None], tie_winner = false, ability_used = false } = {}) {
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
    this.attacker_chop = new ChopFixture(request, this, this.challenge.attacker_id)
    return this.attacker_chop
  }

  defenderChop(request) {
    this.defender_chop = new ChopFixture(request, this, this.challenge.defender_id)
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
