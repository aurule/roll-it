const { Participant } = require("./participant")

describe("db Participant class", () => {
  describe("constructor", () => {
    it("converts `advantages` from json to array", () => {
      const advantages = ["test"]

      const participant = new Participant({
        id: 1,
        advantages: JSON.stringify(advantages),
      })

      expect(participant.advantages).toEqual(advantages)
    })

    it("coerces `tie_winner` to a boolean", () => {
      const participant = new Participant({
        id: 1,
        tie_winner: 1,
      })

      expect(participant.tie_winner).toBe(true)
    })

    it("coerces `ability_used` to a boolean", () => {
      const participant = new Participant({
        id: 1,
        ability_used: 1,
      })

      expect(participant.ability_used).toBe(true)
    })
  })
})
