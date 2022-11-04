"use strict"

module.exports = {
  sum(resultSets) {
    return resultSets.map((set) => set.reduce((a, b) => a+b, 0))
  },

  fate(resultSets) {
    return resultSets.map((set) => set.reduce((a, b) => a + b - 2, 0))
  }
}
