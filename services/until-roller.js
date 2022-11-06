"use strict"

module.exports = {
  /**
   * Repeat a roll until target tally is met or max rolls are reached
   *
   * roll() => [ [2,3,1,4,5] ]
   * tally([[2,3,1,4,5]]) => 15
   *
   * @param  {Callable} options.roll   Function that generates a new roll result
   * @param  {Callable} options.tally  Function that generates a single summed int
   * @param  {Int}      options.target Desired final tally
   * @param  {Int}      options.max    Max rolls to attempt. Zero means no maximum.
   * @return {Object}                  Raw and summed results
   */
  rollUntil({ roll, tally, target, max = 0 }) {
    let raw_results = []
    let summed_results = []

    let rollCount = 0
    let currentResult
    let currentSum
    let runningTally = 0

    while (runningTally < target) {
      if (max && rollCount >= max) break

      currentResult = roll()
      raw_results.push(currentResult[0])
      currentSum = tally(currentResult)
      runningTally += currentSum[0]
      summed_results.push(currentSum[0])
      rollCount++
    }

    return { raw_results, summed_results }
  },
}
