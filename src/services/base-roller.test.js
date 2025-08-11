const rollService = require("./base-roller")

describe("base rollers", () => {
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

      it("includes minimum result", () => {
        const allResults = rollService.roll(100, 2)

        expect(allResults[0]).toContain(1)
      })

      it("includes maximum result", () => {
        const allResults = rollService.roll(100, 2)

        expect(allResults[0]).toContain(2)
      })
    })

    describe("rolls", () => {
      it("generates number of result sets equal to rolls", () => {
        const allResults = rollService.roll(5, 6, 3)

        expect(allResults.length).toEqual(3)
      })
    })
  })

  describe("rollExplode", () => {
    describe("pool", () => {
      it("result set has a length of at least pool", () => {
        const allResults = rollService.rollExplode(5, 6, 6)

        expect(allResults[0].length).toBeGreaterThan(4)
      })
    })

    describe("explode", () => {
      it("throws an error if explode is one", () => {
        expect(() => {
          rollService.rollExplode(5, 6, 1)
        }).toThrow("explode must be greater than 1")
      })

      it("adds dice as threshold is met", () => {
        const allResults = rollService.rollExplode(5, 6, 2)

        expect(allResults[0].length).toBeGreaterThan(5)
      })
    })

    describe("rolls", () => {
      it("generates number of result sets equal to rolls", () => {
        const allResults = rollService.rollExplode(5, 6, 6, 3)

        expect(allResults.length).toEqual(3)
      })
    })
  })
})
