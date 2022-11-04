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

describe("fate", () => {
  it("generates one number per array of the result set", () => {
    const resultSets = [[1,1,2,2], [2,1,3,2], [1,3,1,3]]

    const fateSums = tallyService.fate(resultSets)

    expect(fateSums.length).toEqual(3)
  })

  it("subtracts 1 for every 1 result", () => {
    const resultSets = [[1,2,2,2]]
    const expectedSums = [-1]

    const fateSums = tallyService.fate(resultSets)

    expect(fateSums).toEqual(expectedSums)
  })

  it("ignores every 2 result", () => {
    const resultSets = [[2,2,2,2]]
    const expectedSums = [0]

    const fateSums = tallyService.fate(resultSets)

    expect(fateSums).toEqual(expectedSums)
  })

  it("adds one for every 3 result", () => {
    const resultSets = [[3,2,2,2]]
    const expectedSums = [1]

    const fateSums = tallyService.fate(resultSets)

    expect(fateSums).toEqual(expectedSums)
  })
})
