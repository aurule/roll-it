"use strict"

/**
 * Small helper to generate a random number from 1 to 10, inclusive
 *
 * @return {int} Random integer within [1...10]
 */
function rand() {
  return Math.floor(Math.random() * 10) + 1
}

/**
 * Helper to test whether a rote re-roll should be made
 *
 * Normally, rote re-rolls happen if `rote` is true and the `die` is less than the success `threshold`. When
 * `chance` is true, re-rolls happen if the `die` is greather than 1.
 *
 * @param  {int}  die       Die result to test
 * @param  {int}  threshold Number a die must meet or exceed to score a success
 * @param  {bool} chance    Whether this is a chance roll
 * @return {bool}           True if a rote re-roll should be made for the passed die
 */
function doRote(die, threshold, chance) {
  if (chance) return die != 1
  return die < threshold
}

/**
 * Store and manipulate the options for the nwod roll function
 */
class NwodRollOptions {

  /**
   * Make a new NwodRollOptions object
   *
   * @param  {int}  obj.pool      Size of the array
   * @param  {Int}  obj.explode   Number which adds a die to the pool when rolled
   * @param  {bool} obj.rote      Whether to reroll failed dice from the initial pool
   * @param  {Int}  obj.threshold Number a die must meet or exceed to add one success
   * @param  {bool} obj.chance    Whether this is a special single-die chance roll
   * @param  {Int}  obj.rolls     Number of times to repeat the roll
   */
  constructor({pool, explode, rote, threshold, chance, rolls, decreasing}) {
    this.pool = pool
    this.explode = explode ?? 10
    this.threshold = threshold ?? 8
    this.chance = chance ?? false
    this.rote = rote ?? false
    this.rolls = rolls ?? 1
    this.decreasing = decreasing ?? false

    this.next_index = 0
  }

  /**
   * Move to the next iteration
   *
   * This handles changing the arguments to account for chance dice if decreasing is true and the number of
   * iterations has exceeded the dice pool.
   *
   * @return {Function} [description]
   */
  next() {
    if (this.decreasing && this.next_index) {
      this.pool = Math.max(this.pool - 1, 1)

      if (this.next_index >= this.pool) {
        this.chance = true
        this.explode = 10
        this.threshold = 10
      }
    }

    this.next_index++

    return this
  }

  /**
   * Get whether we're done iterating
   *
   * Must return true when no valid data is available.
   *
   * @return {bool} True if we've iterated through all the rolls, false if not.
   */
  get done() {
    return this.next_index > this.rolls
  }

  /**
   * Get the iterator value
   *
   * This is a smaller object that just has the attributes which may change from roll to roll.
   *
   * @return {obj} Object with pool, explode, chance, and threshold attributes.
   */
  get value() {
    if (this.done) return this.next_index

    return {
      pool: this.pool,
      explode: this.explode,
      chance: this.chance,
      threshold: this.threshold,
    }
  }

  /**
   * Called when the iterating code is finished
   *
   * Importantly, this resets the internal next_index to zero. This is what allows usage by the until roller
   * to work.
   *
   * @param  {any}      _val Optional and discarded.
   * @return {Iterator}      Iterator object with done always true.
   */
  return(_val) {
    this.next_index = 0
    return {value: _val, done: true}
  }

  /**
   * Return this object for iteration.
   *
   * @return {Iterator} This object.
   */
  [Symbol.iterator]() {
    return this
  }
}

/**
 * Return an array of arrays of random numbers simulating dice, where dice at a certain value add another
 * die to the pool
 *
 * The top-level array contains a number of arrays equal to `rolls`. Each member array has a length equal to
 * `pool`. Each integer within those inner arrays will fall between 1 and 10, inclusive.
 *
 * This roller handles some complicated mechanics of nwod rolls. The breakdown is:
 *
 * 1. Roll `pool` number of d10s
 * 2. If `rote` is true, roll another die for every initial result below `threshold`. If `chance` is *also*
 *    true, then an initial result of 1 is not re-rolle, and a success roll of 10 *is* re-rolled.
 * 3. Then, roll another die for every result greater or equal to `explode`
 *
 * @param  {NwodRollOptions} options Options object
 * @return {Array<int[]>}            Array of arrays of random numbers
 */
function roll(options) {
  if (options.explode === 1) throw new RangeError("explode must be greater than 1")

  const output = Array.from(options, (roll_options, idx) => {
    let base_dice = roll_options.pool
    let rote_dice = 0
    const subresult = []

    const result = []
    let currentRoll

    // roll base dice pool
    while (base_dice) {
      currentRoll = rand()
      subresult.push(currentRoll)
      if (options.rote && doRote(currentRoll, roll_options.threshold, roll_options.chance)) rote_dice++
      base_dice--
    }

    // roll rote dice if present
    while (rote_dice) {
      subresult.push(rand())
      rote_dice--
    }

    // use subresult as a stack and handle n-again rerolls
    subresult.reverse()
    var res
    while (subresult.length) {
      res = subresult.pop()
      if (res >= roll_options.explode) subresult.push(rand())
      result.push(res)
    }

    return result
  })

  options.return()

  return output
}

module.exports = {
  NwodRollOptions,
  roll,
  doRote,
}
