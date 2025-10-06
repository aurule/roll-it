const { roll } = require("./swn-roller")

describe("SWN roller", () => {
  describe("roll", () => {
    it("number of results equals rolls", () => {
      const results = roll(2, 5)

      expect(results.length).toEqual(5)
    })

    describe("with no rerolls", () => {
      it("each result has dice equal to pool", () => {
        const results = roll(4)

        expect(results[0].length).toEqual(4)
      })
    })

    describe("with rerolls", () => {
      it("adds dice for 1s in the first pass", () => {
        const results = roll(100, 1, true)

        expect(results[0].length).toBeGreaterThan(100)
      })
    })
  })
})
