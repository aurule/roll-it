const { relativeTimestamp } = require("./timestamps")

describe("timestamp helpers", () => {
  describe("relativeTimestamp", () => {
    it("uses the R style code", () => {
      const result = relativeTimestamp(new Date())

      expect(result).toMatch(":R")
    })
  })
})
