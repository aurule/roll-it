const { roll } = require("./nwod-roller")

describe("pool", () => {
  it("result set has a length of at least pool", () => {
    const allResults = roll(5, 6, 6)

    expect(allResults[0].length).toBeGreaterThan(4)
  })
})

describe("explode", () => {
  it("throws an error if explode is one", () => {
    expect(() => {
      roll(5, 6, 1)
    }).toThrow("explode must be greater than 1")

  })

  it("adds dice as threshold is met", () => {
    const allResults = roll(5, 6, 2)

    expect(allResults[0].length).toBeGreaterThan(5)
  })
})

describe("rolls", () => {
  it("generates number of result sets equal to rolls", () => {
    const allResults = roll(5, 6, 6, 3)

    expect(allResults.length).toEqual(3)
  })
})
