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
  constructor(retester, reason, retest_target, locale = "en") {
    super(retest_target.attacker, retest_target.defender, locale)
    this.retester = retester
    this.reason = reason
    this.chops = retest_target.chops.clone()
  }

  /**
   * Cancel this retest
   * @param  {?Participant} canceller Participant cancelling the retest, or null if cancelled automatically
   * @param  {str}          reason    Reason given for cancelling
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
    const leader = this.leader ?? this.attacker
    const opponent = this.opposition(leader.id)
    const chops = this.t(this.chopsKey, { opponent })

    const t_args = {
      leader,
      chops,
      retester: this.retester,
      reason: this.reason,
      canceller: this.canceller,
      cancel: this.cancelled_with,
    }

    if (this.cancelled) {
      const cancel_key = this.canceller === null ? "automatic" : "manual"
      if (this.outcome === "tie") {
        if (this.leader) {
          return this.t(`retest.response.cancelled.tied.broken.${cancel_key}`, t_args)
        }
        return this.t(`retest.response.cancelled.tied.equal.${cancel_key}`, t_args)
      }
      return this.t(`retest.response.cancelled.outright.${cancel_key}`, t_args)
    }

    if (this.outcome === "tie") {
      if (this.leader) {
        return this.t("retest.response.tied.broken", t_args)
      }
      return this.t("retest.response.tied.equal", t_args)
    }
    return this.t("retest.response.outright", t_args)
  }
}
