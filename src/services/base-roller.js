const { randomInt } = require("mathjs")

module.exports = {
  /**
   * Return an array of arrays of random numbers simulating dice
   *
   * The top-level array contains a number of arrays equal to `rolls`. Each member array has a length equal to
   * `pool`. Each integer within those inner arrays will fall between 1 and `sides`, inclusive.
   *
   * @param  {number}     pool   Size of the array
   * @param  {number}     sides  Max value of each die
   * @param  {number}     rolls  Number of times to repeat the roll
   * @return {number[][]}        Array of arrays of random numbers
   */
  roll(pool, sides, rolls = 1) {
    return Array.from({ length: rolls }, () =>
      Array.from({ length: pool }, () => randomInt(sides) + 1),
    )
  },

  /**
   * Return an array of arrays of random numbers simulating dice, where dice at a certain value add another
   * die to the pool
   *
   * The top-level array contains a number of arrays equal to `rolls`. Each member array has a length equal to
   * `pool`. Each integer within those inner arrays will fall between 1 and `sides`, inclusive.
   *
   * @param  {number}     pool     Size of the array
   * @param  {number}     sides    Max value of each die
   * @param  {number}     explode  Number which adds a die to the pool when rolled
   * @param  {number}     rolls    Number of times to repeat the roll
   * @return {number[][]}          Array of arrays of random numbers
   */
  rollExplode(pool, sides, explode, rolls = 1) {
    if (explode === 1) throw new RangeError("explode must be greater than 1")

    return Array.from({ length: rolls }, () => {
      let dice = pool
      let result = []
      let currentRoll

      while (dice) {
        currentRoll = randomInt(sides) + 1
        dice += currentRoll >= explode
        result.push(currentRoll)
        dice--
      }

      return result
    })
  },
}
