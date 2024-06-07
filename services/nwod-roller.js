"use strict"

module.exports = {
  /**
   * Return an array of arrays of random numbers simulating dice, where dice at a certain value add another
   * die to the pool
   *
   * The top-level array contains a number of arrays equal to `rolls`. Each member array has a length equal to
   * `pool`. Each integer within those inner arrays will fall between 1 and `sides`, inclusive.
   *
   *
   * @param  {int} pool     Size of the array
   * @param  {Int} sides    Max value of each die
   * @param  {Int} explode  Number which adds a die to the pool when rolled
   * @param  {Int} rolls    Number of times to repeat the roll
   * @return {Array<Array<Int>>} Array of arrays of random numbers
   */
  roll(pool, sides, explode, rolls = 1) {
    if (explode === 1) throw new RangeError("explode must be greater than 1")

    return Array.from({ length: rolls }, () => {
      let dice = pool
      let result = []
      let currentRoll

      while (dice) {
        currentRoll = Math.floor(Math.random() * sides) + 1
        dice += currentRoll >= explode
        result.push(currentRoll)
        dice--
      }

      return result
    })
  },
}
