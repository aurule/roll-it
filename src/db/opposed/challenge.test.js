const { Challenge } = require("./challenge")

describe("Challenge class", () => {
  describe("constructor", () => {
    it("converts conditions to an array", () => {
      const conditions = ["test"]

      const challenge = new Challenge({
        id: 1,
        conditions: JSON.stringify(conditions),
      })

      expect(challenge.conditions).toEqual(conditions)
    })

    it("coerces `expired` to boolean", () => {
      const challenge = new Challenge({
        id: 1,
        expired: 1,
      })

      expect(challenge.expired).toBe(true)
    })
  })
})
