module.exports = {
  /**
   * Shrink a result set by keeping a smaller number of dice
   *
   * @param  {Array<int[]>} raw_results Array of lists of die result numbers
   * @param  {Number}       dice        Number of dice to keep in each result
   * @param  {String}       strategy    Method to use to keep dice
   * @return {Array<obj>}               Array of objects, each with an indexes and results attribute
   */
  pick(raw_results, dice=1, strategy="highest") {
    return raw_results.map(raw => {
      if (strategy == "all" || dice >= raw.length) {
        return {
          indexes: Array.from(raw.keys()),
          results: raw,
        }
      }

      const pairs = raw.map((result, idx) => [idx, result])
      pairs.sort((a, b) => a[1] - b[1])

      let picked
      switch(strategy) {
        case "highest":
          picked = pairs.slice(-dice)
          break
        case "lowest":
          picked = pairs.slice(0, dice)
          break
        default:
          throw new TypeError(`unknown pick strategy "${strategy}"`)
      }

      return {
        indexes: picked.map(p => p[0]),
        results: picked.map(p => p[1]),
      }
    })
  },
}
