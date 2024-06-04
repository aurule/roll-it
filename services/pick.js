module.exports = {
  /**
   * Shrink a result set by keeping a smaller number of dice
   *
   * @param  {Array<int[]>} raw_results Array of lists of die result numbers
   * @param  {Number}       dice        Number of dice to keep in each result
   * @param  {String}       strategy    Method to use to keep dice
   * @return {Array<int[]>}             Array of lists of pruned die result numbers
   */
  pick(raw_results, dice=1, strategy="highest") {
    return raw_results.map(raw => {
      if (dice >= raw.length) {
        return raw
      }

      let cutoff
      switch(strategy) {
        case "highest":
          cutoff = raw.toSorted()[raw.length - dice]
          return raw.filter(r => r >= cutoff).slice(-dice)
        case "lowest":
          cutoff = raw.toSorted()[dice]
          return raw.filter(r => r < cutoff)
        default:
          throw new TypeError(`unknown pick strategy "${strategy}"`)
      }
    })
  },
}
