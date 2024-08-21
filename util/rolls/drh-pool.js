const { successes } = require("../../services/tally")

/**
 * Class representing a single dice pool in a Don't Rest Your Head roll
 *
 * Each roll in that system has up to four distinct pools. This class represents a single pool and has helper
 * methods to generate the properties of that roll.
 */
class DrhPool {
  /**
   * Name of the pool
   *
   * @type {string}
   */
  name

  /**
   * Raw roller results
   *
   * @type {Array<int[]>}
   */
  raw

  /**
   * Simplified roller results
   *
   * This simply exposes the first entry of the raw results, since there is only ever one set of dice rolled.
   *
   * @type {int[]}
   */
  dice

  /**
   * Number of dice in the pool
   *
   * Derived from the length of dice.
   *
   * @type {int}
   */
  size

  /**
   * Number of successes per pool, as standard from the tally.successes function
   *
   * @type {int[]}
   */
  summed

  /**
   * Number of successes
   *
   * This simply exposes the first entry of the summed results, since there is only ever one set of dice.
   *
   * @type {int}
   */
  successes

  constructor(name, raw) {
    this.name = name
    this.raw = raw

    this.dice = raw[0]
    this.size = this.dice.length
    this.summed = successes(this.raw, 3, true)
    this.successes = this.summed[0]

    this.spread = Array(7).fill(0)
    for (const die of this.dice) {
      this.spread[die] += 1
    }
  }
}

module.exports = {
  DrhPool,
}
