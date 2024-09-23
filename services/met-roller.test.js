const { roll, compare, handleRequest } = require("./met-roller")

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

  describe("when second is 'none'", () => {
    it("returns empty string", () => {
      const result = compare("bomb", "none")

      expect(result).toEqual("")
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

describe("handleRequest", () => {
  describe("with rand request", () => {
    it("returns an rps array", () => {
      const result = handleRequest("rand", 60)

      expect(result).toContain("paper")
    })

    it("array is correct length", () => {
      const result = handleRequest("rand", 15)

      expect(result.length).toEqual(15)
    })
  })

  describe("with rand-bomb request", () => {
    it("returns an rbs array", () => {
      const result = handleRequest("rand-bomb", 60)

      expect(result).toContain("bomb")
    })

    it("array is correct length", () => {
      const result = handleRequest("rand-bomb", 15)

      expect(result.length).toEqual(15)
    })
  })

  describe("with other request", () => {
    it("returns array of static request string", () => {
      const result = handleRequest("test", 1)

      expect(result).toEqual(["test"])
    })

    it("array is correct length", () => {
      const result = handleRequest("test", 15)

      expect(result.length).toEqual(15)
    })
  })
})
