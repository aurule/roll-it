"use strict"

module.exports = {
  sum(resultSets) {
    return resultSets.map((set) => set.reduce((prev, curr) => prev + curr, 0))
  },

  fate(resultSets) {
    return resultSets.map((set) =>
      set.reduce((prev, curr) => prev + curr - 2, 0)
    )
  },

  successes(resultSets, threshold) {
    return resultSets.map((set) =>
      set.reduce((prev, curr) => prev + (curr >= threshold), 0)
    )
  },

  /**
   * Count successes using World of Darkness 20th Anniversary rules
   *
   * The rules are:
   * - Any die that meets or exceeds threshold adds one success
   * - Any die that rolls a 1 subtracts one success
   * - If `double` is true, then any die that equals a 10 adds an additional success
   * - If the final tally is negative, but one or more successes occurred, then the tally becomes zero
   * - If the final tally is negative, and no successes ocurred at all, then the negative tally stands
   *
   * @param  {Array<Array<Int>>}  resultSets  Array of arrays of ints representing die roll results
   * @param  {Int}                threshold   Number a die must meet or exceed to add one success
   * @param  {Boolean}            double      Whether to add a second success when a die is 10
   * @return {Array<Int>}                     Array of ints representing the success tallies of each resultSet
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
}
