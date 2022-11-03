const rollService = require("./base-roller")

describe("roll", () => {
  describe("pool", () => {
    it("result set has a length of pool", () => {
      const allResults = rollService.roll(5, 6)

      expect(allResults[0].length).toEqual(5)
    })
  })

  describe("sides", () => {
    it("keeps results gte 1", () => {
      const allResults = rollService.roll(100, 2)

      expect(allResults[0]).not.toContain(0)
    })

    it("keeps results lte sides", () => {
      const allResults = rollService.roll(100, 2)

      expect(allResults[0]).not.toContain(3)
    })
  })

  describe("rolls", () => {
    it("generates number of result sets equal to rolls", () => {
      const allResults = rollService.roll(5, 6, 3)

      expect(allResults.length).toEqual(3)
    })
  })
})
