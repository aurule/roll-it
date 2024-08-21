"use strict"

module.exports = {
  /**
   * Add up the dice of result sets
   *
   * @param  {Array<Array<Int>>} resultSets Nested array representing one or more sets of dice rolls
   * @return {Array<Int>}                   Array of sums from each result set
   */
  sum(resultSets) {
    return resultSets.map((set) => set.reduce((prev, curr) => prev + curr, 0))
  },

  /**
   * Add up d3 rolls as fudge dice
   *
   * Each int must be from 1 to 3. The rules are:
   * - Any die that equals 1 subtracts one from the total
   * - Any die that equals 2 is ignored
   * - Any die that equals 3 adds one to the total
   *
   * @param  {Array<Array<Int>>} resultSets Nested array representing one or more sets of dice rolls
   * @return {Array<Int>}                   Array of sums from each result set
   */
  fudge(resultSets) {
    return resultSets.map((set) => set.reduce((prev, curr) => prev + curr - 2, 0))
  },

  /**
   * Count successes using World of Darkness 20th Anniversary rules
   *
   * Each int must be from 1 to 10. The rules are:
   * - Any die that meets or exceeds threshold adds one success
   * - Any die that rolls a 1 subtracts one success
   * - If `double` is true, then any die that equals a 10 adds an additional success
   * - If the final tally is negative, but one or more successes occurred, then the tally becomes zero
   * - If the final tally is negative, and no successes ocurred at all, then the negative tally stands
   *
   * @param  {Array<Array<Int>>} resultSets Nested array representing one or more sets of dice rolls
   * @param  {Int}               threshold  Number a die must meet or exceed to add one success
   * @param  {Boolean}           double     Whether to add a second success when a die is 10
   * @return {Array<Int>}                   Array of ints representing the success tallies of each resultSet
   */
  wod20(resultSets, threshold, double = false) {
    return resultSets.map((set) => {
      let anySuccesses = false

      const successes = set.reduce((prev, curr) => {
        if (curr >= threshold) {
          anySuccesses = true
          return prev + 1 + (double && curr == 10)
        }
        return prev - (curr == 1)
      }, 0)

      if (anySuccesses) {
        return Math.max(successes, 0)
      }
      return successes
    })
  },

  /**
   * Count successes using simple threshold mechanic
   *
   * Whether inverted or not, the threshold value is always counted as a success.
   *
   * @param  {Array<Int[]>} resultSets Nested array representing one or more sets of dice rolls
   * @param  {Int}          threshold  Number a die must meet or exceed to add one success
   * @param  {bool}         inverted   Whether to count dice below the threshold
   * @return {Int[]}                   Array of ints representing the success tallies of each resultSet
   */
  successes(resultSets, threshold, inverted = false) {
    let comparator
    if (inverted) {
      comparator = (prev, curr) => prev + (curr <= threshold)
    } else {
      comparator = (prev, curr) => prev + (curr >= threshold)
    }
    return resultSets.map((set) => set.reduce(comparator, 0))
  },
}
