const { randomInt } = require("mathjs")

/**
 * Small helper to generate a random number from 1 to 6, inclusive
 *
 * @return {int} Random integer within [1...6]
 */
function rand() {
  return randomInt(6) + 1
}

module.exports = {
  /**
   * Return an array of arrays of random numbers simulating dice for Stars Without Number and its sister systems
   *
   * The top-level array contains a number of arrays equal to `rolls`. Each member array has a length equal to
   * `pool`. Each integer within those inner arrays will fall between 1 and 6, inclusive.
   *
   * @param  {int} pool       Size of the array
   * @param  {int} rolls      Number of times to repeat the roll
   * @param  {boolean} reroll Whether to reroll any 1s in the initial result. Defaults to false.
   * @return {Array<int[]>}   Array of arrays of random numbers
   */
  roll(pool, rolls = 1, reroll = false) {
    return Array.from({ length: rolls }, () => {
      const first_results = Array.from({ length: pool }, rand)
      if (!reroll) return first_results

      return first_results.flatMap((result) => (result === 1 ? [result, rand()] : result))
    })
  },
}
