const tallyService = require("./tally")

describe("sum", () => {
  const resultSets = [
    [5, 10],
    [2, 3],
    [3, 4],
  ]

  it("generates one number per array of the result set", () => {
    const sums = tallyService.sum(resultSets)

    expect(sums.length).toEqual(3)
  })

  it("sums each result set", () => {
    const expectedSums = [15, 5, 7]

    const sums = tallyService.sum(resultSets)

    expect(sums).toEqual(expectedSums)
  })
})

describe("pickedSum", () => {
  describe("when all dice are picked", () => {
    const resultSets = [
      [5, 10],
      [2, 3],
      [3, 4],
    ]
    const pickedDice = [{ indexes: [0, 1] }, { indexes: [0, 1] }, { indexes: [0, 1] }]

    it("generates one number per array of the result set", () => {
      const sums = tallyService.pickedSum(resultSets, pickedDice)

      expect(sums.length).toEqual(3)
    })

    it("sums each result set", () => {
      const expectedSums = [15, 5, 7]

      const sums = tallyService.pickedSum(resultSets, pickedDice)

      expect(sums).toEqual(expectedSums)
    })
  })

  describe("when only some dice are picked", () => {
    const resultSets = [
      [5, 10, 6],
      [2, 3, 9],
      [3, 4, 1],
    ]
    const pickedDice = [{ indexes: [0, 2] }, { indexes: [1, 2] }, { indexes: [0, 1] }]

    it("sums the picked pickedDice", () => {
      const expectedSums = [11, 12, 7]

      const sums = tallyService.pickedSum(resultSets, pickedDice)

      expect(sums).toEqual(expectedSums)
    })
  })
})

describe("fudge", () => {
  it("generates one number per array of the result set", () => {
    const resultSets = [
      [1, 1, 2, 2],
      [2, 1, 3, 2],
      [1, 3, 1, 3],
    ]

    const fudgeSums = tallyService.fudge(resultSets)

    expect(fudgeSums.length).toEqual(3)
  })

  it("subtracts 1 for every 1 result", () => {
    const resultSets = [[1, 2, 2, 2]]
    const expectedSums = [-1]

    const fudgeSums = tallyService.fudge(resultSets)

    expect(fudgeSums).toEqual(expectedSums)
  })

  it("ignores every 2 result", () => {
    const resultSets = [[2, 2, 2, 2]]
    const expectedSums = [0]

    const fudgeSums = tallyService.fudge(resultSets)

    expect(fudgeSums).toEqual(expectedSums)
  })

  it("adds one for every 3 result", () => {
    const resultSets = [[3, 2, 2, 2]]
    const expectedSums = [1]

    const fudgeSums = tallyService.fudge(resultSets)

    expect(fudgeSums).toEqual(expectedSums)
  })
})

describe("wod20", () => {
  it("generates one number per array of the result set", () => {
    const resultSets = [
      [1, 3, 5, 7],
      [2, 4, 6, 8],
      [3, 6, 9, 10],
    ]

    const successSums = tallyService.wod20(resultSets, 6)

    expect(successSums.length).toEqual(3)
  })

  it("adds a success for a number that meets threshold", () => {
    const resultSets = [[5, 6, 7]]

    const successSums = tallyService.wod20(resultSets, 7)

    expect(successSums[0]).toEqual(1)
  })

  it("adds a success for a number that exceeds threshold", () => {
    const resultSets = [[5, 6, 7]]

    const successSums = tallyService.wod20(resultSets, 6)

    expect(successSums[0]).toEqual(2)
  })

  it("subtracts a success for every 1", () => {
    const resultSets = [[1, 5, 6, 7]]

    const successSums = tallyService.wod20(resultSets, 6)

    expect(successSums[0]).toEqual(1)
  })

  it("rounds to 0 if negative and any 1s", () => {
    const resultSets = [[1, 1, 1, 7]]

    const successSums = tallyService.wod20(resultSets, 6)

    expect(successSums[0]).toEqual(0)
  })

  it("returns negative if no successes and any 1s", () => {
    const resultSets = [[1, 1, 1, 3]]

    const successSums = tallyService.wod20(resultSets, 6)

    expect(successSums[0]).toEqual(-3)
  })

  it("counts tens twice if asked", () => {
    const resultSets = [[2, 3, 4, 10]]

    const successSums = tallyService.wod20(resultSets, 6, true)

    expect(successSums[0]).toEqual(2)
  })
})

describe("successes", () => {
  it("generates one number per array of the result set", () => {
    const resultSets = [
      [1, 3, 5, 7],
      [2, 4, 6, 8],
      [3, 6, 9, 10],
    ]

    const successSums = tallyService.successes(resultSets, 6)

    expect(successSums.length).toEqual(3)
  })

  it("adds a success for a number that exceeds threshold", () => {
    const resultSets = [[5, 6, 7]]

    const successSums = tallyService.successes(resultSets, 6)

    expect(successSums[0]).toEqual(2)
  })

  it("adds a success for a number that meets threshold", () => {
    const resultSets = [[5, 6, 7]]

    const successSums = tallyService.successes(resultSets, 7)

    expect(successSums[0]).toEqual(1)
  })

  describe("inverted", () => {
    it("adds a success for a number under the threshold", () => {
      const resultSets = [[5, 6, 7]]

      const successSums = tallyService.successes(resultSets, 6, true)

      expect(successSums[0]).toEqual(2)
    })

    it("adds a success for a number that meets threshold", () => {
      const resultSets = [[5, 6, 7]]

      const successSums = tallyService.successes(resultSets, 5, true)

      expect(successSums[0]).toEqual(1)
    })
  })
})
