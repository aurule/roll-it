const Test = require("./met-test")
const Retest = require("./retest")

/**
 * Class to store and interact with a series of Test objects at a high level
 *
 * All Test objects in a single TestRecorder are assumed to be part of a single challenge.
 */
module.exports = class TestRecorder {
  /**
   * The participant who initiated the overall challenge
   * @type {Participant}
   */
  attacker

  /**
   * The participant who did not initiate the overall challenge
   * @type {Participant}
   */
  defender

  /**
   * Array of Test objects that a part of our challenge
   * @type {Test[]}
   */
  tests = []

  /**
   * Create a new TestRecorder
   * @param  {Participant} attacker Participant who initiated the overall challenge
   * @param  {Participant} defender Participant who did not initiate the overall challenge
   */
  constructor(attacker, defender) {
    this.attacker = attacker
    this.defender = defender
  }

  /**
   * Add a new Rest
   *
   * This is meant to be called a single time at the start of the challenge.
   *
   * @returns {Test} The Test that was added
   */
  addTest() {
    const test = new Test(this.attacker, this.defender)
    this.tests.push(test)
    return test
  }

  /**
   * Add a new Retest
   *
   * The new Retest automatically uses the previous Test in the stack as its target.
   *
   * @param   {Participant} retester Participant who started the retest
   * @param   {str}         reason   Reason given for the retest
   * @returns {Retest}               The Retest that was added
   */
  addRetest(retester, reason) {
    const retest = new Retest(retester, reason, this.latest)
    this.tests.push(retest)
    return retest
  }

  /**
   * Get the most recent test
   * @type {Test}
   */
  get latest() {
    return this.tests.at(-1)
  }
}
