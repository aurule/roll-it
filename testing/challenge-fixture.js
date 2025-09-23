const { Opposed } = require("../src/db/opposed")
const { Challenge } = require("../src/db/opposed/challenge")
const { Participant } = require("../src/db/opposed/participant")

/**
 * Class for creating and manipulating an opposed challenge record during tests
 *
 * This class and its related classes are designed to streamline test setup.
 */
class ChallengeFixture {
  /**
   * Database object
   * @type db
   */
  db

  /**
   * Database ID of the associated record
   * @type int
   */
  id

  /**
   * Fake discord ID of the attacking participant
   * @type String
   */
  attacker_uid = "atk"

  /**
   * Attacker fixture
   * @type ParticipantFixture | null
   */
  attacker

  /**
   * Fake discord ID of the defending participant
   * @type String
   */
  defender_uid = "def"

  /**
   * Defender fixture
   * @type ParticipantFixture | null
   */
  defender

  /**
   * Test fixture objects
   * @type TestFixture[]
   */
  tests = []

  /**
   * Create a new ChallengeFixture
   * @param  {string}           state  Initial state of the challenge. Defaults to AdvantagesAttacker.
   * @param  {db}               db_obj Base database object to use
   * @return {ChallengeFixture}        New challenge fixture
   */
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

  /**
   * Destroy this record and its children
   *
   * Best to call in an afterEach block to keep memory bloat down.
   *
   * @return {Info} Query info object
   */
  cleanup() {
    return this.db.destroy(this.id)
  }

  /**
   * The associated record
   * @type Challenge
   */
  get record() {
    return this.db.getChallenge(this.id)
  }

  /**
   * Update the summary text
   * @param {string} summary New summary text
   * @return {ChallengeFixture} This fixture
   */
  setSummary(summary) {
    this.db.setChallengeSummary(this.id, summary)
    return this
  }

  setConditions(conditions) {
    this.db.setChallengeConditions(this.id, conditions)
    return this
  }

  /**
   * Mark the challenge as expired
   * @return {ChallengeFixture} This fixture
   */
  expire() {
    this.db.setChallengeExpired(this.id)
    return this
  }

  /**
   * Add an attacking participant record
   * @return {ParticipantFixture} Attacker participant fixture
   */
  addAttacker() {
    this.attacker = new ParticipantFixture(this, this.attacker_uid, Participant.Roles.Attacker)
    return this.attacker
  }

  /**
   * Add an defending participant record
   * @return {ParticipantFixture} Defender participant fixture
   */
  addDefender() {
    this.defender = new ParticipantFixture(this, this.defender_uid, Participant.Roles.Defender)
    return this.attacker
  }

  /**
   * Add both participant records
   * @return {ChallengeFixture} This fixture
   */
  withParticipants() {
    this.addAttacker()
    this.addDefender()

    return this
  }

  /**
   * Add a message record that can be used to look up our challenge
   * @param  {string}           message_uid Discord ID of the message
   * @return {ChallengeFixture}             This fixture
   */
  attachMessage(message_uid) {
    this.db.addMessage({
      message_uid,
      challenge_id: this.id,
    })
    return this
  }

  /**
   * Add a test to the challenge
   * @param {Object}       options Options to pass to the TestFixture
   * @return {TestFixture}         New test fixture object
   */
  addTest(options = {}) {
    const test = new TestFixture(this, options)
    this.tests.push(test)
    return test
  }

  /**
   * Add an attacker-led retest
   *
   * The test added has the following already set:
   * - attacker is the retester
   * - defender is the canceller
   * - retest reason is the given arg
   * - retested flag true
   *
   * Notably, no leader is set.
   *
   * @param  {string}      reason Reason for the retest
   * @return {TestFixture}        New test fixture
   */
  attackerRetest(reason) {
    return this.addTest({
      retester_id: this.attacker.id,
      canceller_id: this.defender.id,
      retest_reason: reason,
      retested: true,
    })
  }

  /**
   * Add a defender-led retest
   *
   * The test added has the following already set:
   * - defender is the retester
   * - attacker is the canceller
   * - retest reason is the given arg
   * - retested flag true
   *
   * Notably, no leader is set.
   *
   * @param  {string}      reason Reason for the retest
   * @return {TestFixture}        New test fixture
   */
  defenderRetest(reason) {
    return this.addTest({
      retester_id: this.defender.id,
      canceller_id: this.attacker.id,
      retest_reason: reason,
      retested: true,
    })
  }

  /**
   * Add an attacker-led winning test
   *
   * The test added has the following already set:
   * - attacker is the leader
   * - text breakdown is a static string
   *
   * @return {TestFixture} New test fixture
   */
  addAttackerWin() {
    return this.addTest({
      leader_id: this.attacker.id,
      breakdown: "scissors vs paper",
    })
  }

  /**
   * Add a defender-led winning test
   *
   * The test added has the following already set:
   * - defender is the leader
   * - text breakdown is a static string
   *
   * @return {TestFixture} New test fixture
   */
  addDefenderWin() {
    return this.addTest({
      leader_id: this.defender.id,
      breakdown: "rock vs paper",
    })
  }

  /**
   * Add a tied test
   *
   * The test added has the following already set:
   * - breakdown is a static string
   * - leader is specifically undefined
   *
   * @return {TestFixture} New test fixture
   */
  addTie() {
    return this.addTest({
      breakdown: "paper vs paper",
    })
  }
}

/**
 * Class for creating and manipulating a challenge participant record during tests
 */
class ParticipantFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  /**
   * Internal ID of the fixture's associated record
   * @type int
   */
  id

  /**
   * Challenge fixture this participant belongs to
   * @type ChallengeFixture
   */
  challenge

  /**
   * Fake Discord ID of the participating user
   * @type string
   */
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

  /**
   * The associated record
   * @type Participant
   */
  get record() {
    return this.db.getParticipant(this.id)
  }

  /**
   * Set the advantages for this participant
   *
   * @param  {string[]}    advantages Array of advantage keywords.
   * @return {Participant}            This participant object
   */
  setAdvantages(advantages) {
    this.db.setParticipantAdvantages(this.id, advantages)
    return this
  }

  /**
   * Set the ability_used flag to `true` for this participant
   * @return {Participant} This participant object
   */
  abilityUsed() {
    this.db.setParticipantAbilityUsed(this.id, true)
    return this
  }

  /**
   * Set the tie_winner flag to `true` for this participant
   * @return {Participant} This participant object
   */
  winsTies() {
    this.db.setTieWinner(this.id, true)
    return this
  }
}

/**
 * Class for creating and manipulating a single test record during tests
 */
class TestFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  /**
   * Internal ID of the fixture's associated record
   * @type int
   */
  id

  /**
   * Challenge fixture this test belongs to
   * @type ChallengeFixture
   */
  challenge

  /**
   * Chop fixture for the attacking user
   * @type ChopFixture
   */
  attacker_chop

  /**
   * Chop fixture for the defending user
   * @type ChopFixture
   */
  defender_chop

  /**
   * Create a new TestFixture
   *
   * @see src/db/opposed.addTest
   *
   * @param  {ChallengeFixture} challenge Parent challenge
   * @param  {object} options   Options to pass to the addTest method
   * @return {TestFixture}      New TestFixture object
   */
  constructor(challenge, options) {
    this.challenge = challenge
    this.db = challenge.db

    this.id = this.db.addTest({
      ...options,
      challenge_id: this.challenge.id,
      locale: "en-US",
    }).lastInsertRowid
  }

  /**
   * The associated record
   * @type OpTest
   */
  get record() {
    return this.db.getTest(this.id)
  }

  /**
   * Add a message record that can be used to look up our test
   * @param  {string}      message_uid Discord ID of the message
   * @return {TestFixture}             This fixture
   */
  attachMessage(message_uid) {
    this.db.addMessage({
      message_uid,
      challenge_id: this.challenge.id,
      test_id: this.id,
    })
    return this
  }

  /**
   * Set the retest reason for this test
   * @param  {string}      reason Retest reason
   * @return {TestFixture}        This fixture
   */
  retestReason(reason) {
    this.db.setTestRetestReason(this.id, reason)
    return this
  }

  /**
   * Set the leading participant for this test
   * @param  {ParticipantFixture} participant Participant to set as the leader
   * @return {TestFixture}        This fixture
   */
  setLeader(participant) {
    this.db.setTestLeader(this.id, participant.id)
    return this
  }

  /**
   * Set the cancel reason for this test
   * @param  {string}      reason Cancel reason
   * @return {TestFixture}        This fixture
   */
  cancelWith(reason) {
    this.db.setTestCancelledWith(this.id, reason)
    return this
  }

  /**
   * Create a chop request on this test for the attacking participant
   * @param  {string}      request Request string for the chop
   * @return {ChopFixture}         New chop fixture
   */
  attackerChop(request) {
    this.attacker_chop = new ChopFixture(request, this, this.challenge.attacker.id)
    return this.attacker_chop
  }

  /**
   * Create a chop request on this test for the defending participant
   * @param  {string}      request Request string for the chop
   * @return {ChopFixture}         New chop fixture
   */
  defenderChop(request) {
    this.defender_chop = new ChopFixture(request, this, this.challenge.defender.id)
    return this.defender_chop
  }
}

/**
 * Class for creating and manipulating a single chop record during tests
 */
class ChopFixture {
  /**
   * Database object
   * @type Opposed
   */
  db

  /**
   * Internal ID of the fixture's associated record
   * @type int
   */
  id

  /**
   * Test fixture this chop belongs to
   * @type TestFixture
   */
  test

  /**
   * The given symbol request
   *
   * This is the plain request, not the resolved symbol.
   *
   * @type string
   */
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

  /**
   * The associated record
   * @type Chop
   */
  get record() {
    return this.db.getChop(this.id)
  }

  /**
   * Set the traits for this chop
   * @param  {int}         traits Number of traits
   * @return {ChopFixture}        This fixture
   */
  setTraits(traits) {
    this.db.setChopTraits(this.id, traits)
    return this
  }

  /**
   * Set this chop's ready flag to true
   * @return {ChopFixture} This fixture
   */
  ready() {
    this.db.setChopReady(this.id, true)
    return this
  }

  /**
   * Resolve the request to a real chop
   *
   * The result can be set by supplying forced_result, or rolled normally using the met-roller.
   *
   * @param  {string?}     forced_result Desired result. Optional. Rolled normally if not supplied.
   * @return {ChopFixture}               This fixture
   */
  resolve(forced_result) {
    const result = forced_result ?? this.request
    this.db.setChopResult(this.id, result)
    return this
  }

  /**
   * Set this chop's tie_accepted flag to true
   * @return {ChopFixture} This fixture
   */
  accept() {
    this.db.setChopTieAccepted(this.id, true)
    return this
  }
}

module.exports = {
  ChallengeFixture,
}
