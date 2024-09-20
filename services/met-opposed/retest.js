const Test = require("./met-test")

/**
 * Class for managing a followup back-and-forth test referencing a previous test
 * @extends Test
 */
module.exports = class Retest extends Test {
  /**
   * The participant who requested the retest
   * @type {Participant}
   */
  retester

  /**
   * Reason given for the retest
   * @type {str}
   */
  reason

  /**
   * The participant who cancelled the retest, if any
   * @type {Participant|undefined}
   */
  canceller

  /**
   * Reason given for cancelling the retest
   * @type {str|undefined}
   */
  cancelled_with

  /**
   * Create a new Retest
   *
   * Duplicates the chops of retest_target to provide data in case the retest is cancelled.
   *
   * @param  {Participant} retester      Participant requesting the retest
   * @param  {str}         reason        Reason given for the retest
   * @param  {Test}        retest_target The original test that is being retested
   */
  constructor(retester, reason, retest_target) {
    super(retest_target.attacker, retest_target.defender)
    this.retester = retester
    this.reason = reason
    this.chops = retest_target.chops.clone()
  }

  /**
   * Cancel this retest
   * @param  {Participant} canceller Prticipant cancelling the retest
   * @param  {str}         reason    Reason given for cancelling
   * @return {undefined}
   */
  cancel(canceller, reason) {
    this.canceller = canceller
    this.cancelled_with = reason
  }

  /**
   * Whether the retest has been cancelled
   * @type {bool}
   */
  get cancelled() {
    return !!this.cancelled_with
  }

  /**
   * @inheritdoc
   */
  present() {
    return [
      this.explainLeader(),
      " (",
      this.explainRetest(),
      this.explainChops(),
      this.explainTies(),
      ")",
    ].join("")
  }

  /**
   * Explain the status of this retest
   *
   * Includes a description of cancellation if cancelled.
   *
   * @return {str} Description of the retest and cancellation
   */
  explainRetest() {
    let content = `${this.retester.mention} retested with ${this.reason}`
    if (this.cancelled) content += `, ${this.canceller.mention} cancelled with ${this.cancelled_with}`
    return content
  }

  /**
   * Chops string, or empty if cancelled
   * @return {str} Explanation of our chops, or an empty string
   * @see Test.explainChops
   */
  explainChops() {
    if (this.cancelled) return ""
    return super.explainChops()
  }

  /**
   * Ties string, or empty if cancelled
   * @return {str} Explanation of ties
   * @see Test.explainTies
   */
  explainTies() {
    if (this.cancelled) return ""
    return super.explainTies()
  }
}
