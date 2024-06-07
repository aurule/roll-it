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

module.exports = {
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
   * @param  {int}  obj.pool      Size of the array
   * @param  {Int}  obj.explode   Number which adds a die to the pool when rolled
   * @param  {bool} obj.rote      Whether to reroll failed dice from the initial pool
   * @param  {Int}  obj.threshold Number a die must meet or exceed to add one success
   * @param  {bool} obj.chance    Whether this is a special single-die chance roll
   * @param  {Int}  obj.rolls     Number of times to repeat the roll
   * @return {Array<int[]>}       Array of arrays of random numbers
   */
  roll({pool, explode, rote = false, threshold = 8, chance = false, rolls = 1}) {
    if (explode === 1) throw new RangeError("explode must be greater than 1")

    return Array.from({ length: rolls }, () => {
      let base_dice = pool
      let rote_dice = 0
      const subresult = []

      const result = []
      let currentRoll

      // roll base dice pool
      while (base_dice) {
        currentRoll = rand()
        subresult.push(currentRoll)
        if (rote && doRote(currentRoll, threshold, chance)) rote_dice++
        base_dice--
      }

      // roll rote dice if present
      while(rote_dice) {
        subresult.push(rand())
        rote_dice--
      }

      // use subresult as a stack and handle n-again rerolls
      subresult.reverse()
      var res
      while(subresult.length) {
        res = subresult.pop()
        if (res >= explode) subresult.push(rand())
        result.push(res)
      }

      return result
    })
  },
  doRote,
}
