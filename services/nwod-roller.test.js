const NwodRoller = require("./nwod-roller")

describe("roll", () => {
  describe("pool", () => {
    it("result set has a length of at least pool", () => {
      const allResults = NwodRoller.roll({pool: 5, explode: 6})

      expect(allResults[0].length).toBeGreaterThan(4)
    })
  })

  describe("explode", () => {
    it("throws an error if explode is one", () => {
      expect(() => {
        NwodRoller.roll({pool: 5, explode: 1})
      }).toThrow("explode must be greater than 1")

    })

    it("adds dice as threshold is met", () => {
      const allResults = NwodRoller.roll({pool: 5, explode: 2})

      expect(allResults[0].length).toBeGreaterThan(5)
    })
  })

  describe("rote", () => {
    it("re-rolls failed dice from the initial pool", () => {
      const results = NwodRoller.roll({
        pool: 5,
        explode: 11,
        rote: true,
        threshold: 10,
      })

      expect(results[0].length).toBeGreaterThan(5)
    })
  })

  describe("rolls", () => {
    it("generates number of result sets equal to rolls", () => {
      const allResults = NwodRoller.roll({pool: 5, explode: 6, rolls: 3})

      expect(allResults.length).toEqual(3)
    })
  })
})

describe("doRote", () => {
  describe("normal mode", () => {
    it("true when die is a fail", () => {
      const result = NwodRoller.doRote(4, 8, false)

      expect(result).toBeTruthy()
    })

    it("false when die is a success", () => {
      const result = NwodRoller.doRote(9, 8, false)

      expect(result).toBeFalsy()
    })
  })

  describe("chance mode", () => {
    it("false when die is a 1", () => {
      const result = NwodRoller.doRote(1, 10, true)

      expect(result).toBeFalsy()
    })

    it("true when die is a normal failure", () => {
      const result = NwodRoller.doRote(5, 10, true)

      expect(result).toBeTruthy()
    })

    it("true when die is 10", () => {
      const result = NwodRoller.doRote(10, 10, true)

      expect(result).toBeTruthy()
    })
  })
})
