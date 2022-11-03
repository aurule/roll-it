const tallyService = require("./tally")

describe("sum", () => {
  it("generates one number per array of the result set", () => {
    const resultSets = [[5, 10], [2, 3], [3, 4]]

    const sums = tallyService.sum(resultSets)

    expect(sums.length).toEqual(3)
  })

  it("sums each result set", () => {
    const resultSets = [[5, 10], [2, 3], [3, 4]]
    const expectedSums = [15, 5, 7]

    const sums = tallyService.sum(resultSets)

    expect(sums).toEqual(expectedSums)
  })
})
