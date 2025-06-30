const { Collection } = require("discord.js")

/**
 * Special class for handling opposed test records
 *
 * The main feature is that this class will lazy-load and pouplate the various related participant records.
 *
 * @class
 */
class OpTest {
  /**
   * Database ID of our corresponding test record
   * @type {int}
   */
  id

  /**
   * Database ID of our parent challenge record
   * @type {int}
   */
  challenge_id

  /**
   * Locale code for rendering strings
   * @type {str}
   */
  locale

  /**
   * Database ID of the participant who retested this test
   *
   * @type {int}
   */
  retester_id = null

  /**
   * Retest code given
   * @type {str}
   */
  retest_reason = null

  /**
   * Whether this test has been retested
   * @type {Boolean}
   */
  retested = false

  /**
   * Database ID of the participant who cancelled this test's retest
   *
   * @type {int}
   */
  canceller_id = null

  /**
   * Cancel code given
   * @type {str}
   */
  cancelled_with = null

  /**
   * Whether this test's retest was cancelled
   * @type {Boolean}
   */
  cancelled = false

  /**
   * Displayable history text of this test
   * @type {str}
   */
  history = null

  /**
   * Displayable short breakdown of the test's result
   * @type {str}
   */
  breakdown = null

  /**
   * Database ID of the participant who is currently the winner of the test
   *
   * @type {int}
   */
  leader_id = null

  /**
   * Database handler
   * @type {Opposed}
   */
  opposed_db

  /**
   * Collection of related database records
   *
   * This is used as a cache for lazy-loading related records.
   *
   * @type {Collection<str, obj>}
   */
  records

  /**
   * Create a new OpTest
   *
   * @param  {object}  options
   * @param  {int}     options.id             ID of the test record
   * @param  {int}     options.challenge_id   ID of the parent challenge
   * @param  {str}     options.locale         Locale code
   * @param  {int}     options.retester_id    ID of the retesting participant
   * @param  {str}     options.retest_reason  Retest code
   * @param  {Boolean} options.retested       Whether the initial result was retested
   * @param  {int}     options.canceller_id   ID of the cancelling participant
   * @param  {str}     options.cancelled_with Cancel code
   * @param  {Boolean} options.cancelled      Whether the retest was cancelled
   * @param  {str}     options.history        Displayable test history
   * @param  {str}     options.breakdown      Displayable result details
   * @param  {int}     options.leader_id      ID of the winning participant
   * @param  {Opposed} options.opposed_db     DB object
   * @return {OpTest}                         New OpTest object
   */
  constructor({
    id,
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
    opposed_db,
  } = {}) {
    this.id = id
    this.challenge_id = challenge_id
    this.locale = locale
    this.retester_id = retester_id
    this.retest_reason = retest_reason
    this.retested = !!retested
    this.canceller_id = canceller_id
    this.cancelled_with = cancelled_with
    this.cancelled = !!cancelled
    this.history = history
    this.breakdown = breakdown
    this.leader_id = leader_id

    this.opposed_db = opposed_db

    this.records = new Collection()
  }

  /**
   * Lazily load the related participant records
   *
   * @param  {str} key Key of the participant record to return
   * @return {Participant|undefined} The named participant record, or undefined if not found
   */
  populateParticipants(key) {
    const { ParticipantRoles } = require("../opposed")
    const participants = this.opposed_db.getParticipants(this.challenge_id, true)
    this.records.set("leader", participants.get(this.leader_id))
    this.records.set(
      "trailer",
      participants.find((p) => p.id != this.leader_id),
    )
    this.records.set("retester", participants.get(this.retester_id))
    this.records.set("canceller", participants.get(this.canceller_id))
    this.records.set(
      "attacker",
      participants.find((p) => p.role === ParticipantRoles.Attacker),
    )
    this.records.set(
      "defender",
      participants.find((p) => p.role === ParticipantRoles.Defender),
    )
    return this.records.get(key)
  }

  /**
   * Participant who is currently winning this test
   * @return {Participant} Leading participant record
   */
  get leader() {
    return this.records.ensure("leader", (key) => this.populateParticipants(key))
  }

  /**
   * Participant who is currently losing this test
   * @return {Participant} Trailing participant record
   */
  get trailer() {
    return this.records.ensure("trailer", (key) => this.populateParticipants(key))
  }

  /**
   * Participant who retested the initial result
   * @return {Participant} Retesting participant record
   */
  get retester() {
    return this.records.ensure("retester", (key) => this.populateParticipants(key))
  }

  /**
   * Participant who cancelled the retest
   * @return {Participant} Cancelling participant record
   */
  get canceller() {
    return this.records.ensure("canceller", (key) => this.populateParticipants(key))
  }

  /**
   * Participant who initiated the overall challenge
   * @return {Participant} Attacking participant record
   */
  get attacker() {
    return this.records.ensure("attacker", (key) => this.populateParticipants(key))
  }

  /**
   * Participant who is the opponent of the overall challenge
   * @return {Participant} Defending participant record
   */
  get defender() {
    return this.records.ensure("defender", (key) => this.populateParticipants(key))
  }

  /**
   * Parent challenge record
   * @return {Challenge} Challenge record
   */
  get challenge() {
    return this.records.ensure("challenge", () => this.opposed_db.getChallenge(this.challenge_id))
  }
}

module.exports = {
  OpTest,
}
