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

  describe("finished", () => {
    it("true when challenge is in a final state", () => {
      const challenge = new Challenge({
        id: 1,
        state: Challenge.States.Withdrawn
      })

      expect(challenge.finished).toBe(true)
    })

    it("false when challenge is in a final state", () => {
      const challenge = new Challenge({
        id: 1,
        state: Challenge.States.Throwing
      })

      expect(challenge.finished).toBe(false)
    })
  })
})
