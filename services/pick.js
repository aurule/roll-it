/**
 * All strategy names that are supported
 * @type {Array}
 */
const strategies = ["highest", "lowest", "all"]

/**
 * Keep a number of array entries using the given strategy
 *
 * @param  {number[]} source   Array to pick from
 * @param  {int}      keep     Number of results to keep
 * @param  {str}      strategy Name of the strategy to use. Must appear in `strategies`.
 * @return {obj}               Object containing an indexes and results attribute.
 */
function keepFromArray(source, keep, strategy) {
  if (!strategies.includes(strategy)) {
    throw new TypeError(`unknown pick strategy "${strategy}"`)
  }

  if (strategy == "all" || keep >= source.length) {
    return {
      indexes: Array.from(source.keys()),
      results: source,
    }
  }

  const pairs = source.map((result, idx) => [idx, result])
  pairs.sort((a, b) => a[1] - b[1])

  let picked
  switch (strategy) {
    case "highest":
      picked = pairs.slice(-keep)
      break
    case "lowest":
      picked = pairs.slice(0, keep)
      break
  }

  return {
    indexes: picked.map((p) => p[0]),
    results: picked.map((p) => p[1]),
  }
}

module.exports = {
  strategies,
  keepFromArray,

  /**
   * Shrink a result set by keeping a smaller number of dice
   *
   * @param  {Array<int[]>} raw_results Array of lists of die result numbers
   * @param  {Number}       dice        Number of dice to keep in each result
   * @param  {String}       strategy    Method to use to keep dice
   * @return {Array<obj>}               Array of objects, each with an indexes and results attribute
   */
  pickDice(raw_results, dice = 1, strategy = "highest") {
    return raw_results.map((raw) => keepFromArray(raw, dice, strategy))
  },
}
