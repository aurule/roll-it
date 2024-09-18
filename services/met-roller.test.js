const { roll, compare } = require("./met-roller")

describe("roll", () => {
  it("without bomb, returns rps", () => {
    const results = roll(false, 60)

    expect(results).toContain("paper")
  })

  it("with bomb, returns rbs", () => {
    const results = roll(true, 60)

    expect(results).toContain("bomb")
  })
})

describe("compare", () => {
  describe("with matching inputs", () => {
    it("returns tie", () => {
      const result = compare("paper", "paper")

      expect(result).toEqual("tie")
    })
  })

  describe.each([
    ["rock",     "paper",    "lose"],
    ["rock",     "scissors", "win"],
    ["rock",     "bomb",     "lose"],
    ["paper",    "rock",     "win"],
    ["paper",    "scissors", "lose"],
    ["paper",    "bomb",     "lose"],
    ["scissors", "rock",     "lose"],
    ["scissors", "paper",    "win"],
    ["scissors", "bomb",     "win"],
    ["bomb",     "rock",     "win"],
    ["bomb",     "paper",    "win"],
    ["bomb",     "scissors", "lose"],
  ])("%s", (first, second, outcome) => {
    it(`${first} vs ${second} will ${outcome}`, () => {
      const result = compare(first, second)

      expect(result).toEqual(outcome)
    })
  })
})
