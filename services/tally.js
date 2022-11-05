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
}
