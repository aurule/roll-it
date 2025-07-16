const { successes } = require("../../services/tally")
const { roll } = require("../../services/base-roller")

/**
 * Class representing a single dice pool in a Don't Rest Your Head roll
 *
 * Each roll in that system has up to four distinct pools. This class represents a single pool.
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

  /**
   * Create a new DrhPool object
   *
   * @param  {string}       name Name of the pool
   * @param  {Array<int[]>} raw  Array of raw roll results
   * @return {DrhPool}           New object
   */
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

  /**
   * Create a new DrhPool using the given number of dice
   *
   * @param  {string} name       Name of the pool
   * @param  {int}    dice       Number of dice for the pool
   * @return {DrhPool|undefined} New pool object, or undefined if no dice
   */
  static fromPool(name, dice) {
    if (!dice) return undefined

    const raw = roll(dice, 6)

    return new DrhPool(name, raw)
  }
}

module.exports = {
  DrhPool,
}
