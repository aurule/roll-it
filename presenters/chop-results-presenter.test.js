const ChopResultsPresenter = require("./chop-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("present", () => {
  const defaultArgs = {
    static_test: false,
    bomb: false,
    description: "test roll",
    raw: [[1]],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = ChopResultsPresenter.present(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes description if present", () => {
    const result = ChopResultsPresenter.present(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("rollToEmoji", () => {
  describe("with no modifiers", () => {
    const static_test = false
    const bomb = false

    it("maps 1 to rock", () => {
      const result = ChopResultsPresenter.rollToEmoji(1, static_test, bomb)

      expect(result).toMatch("rock")
    })

    it("maps 2 to paper", () => {
      const result = ChopResultsPresenter.rollToEmoji(2, static_test, bomb)

      expect(result).toMatch("scroll")
    })

    it("maps 3 to scissors", () => {
      const result = ChopResultsPresenter.rollToEmoji(3, static_test, bomb)

      expect(result).toMatch("scissors")
    })
  })

  describe("with static modifier", () => {
    const static_test = true
    const bomb = false

    it("maps 1 to pass", () => {
      const result = ChopResultsPresenter.rollToEmoji(1, static_test, bomb)

      expect(result).toMatch("pass")
    })

    it("maps 2 to tie", () => {
      const result = ChopResultsPresenter.rollToEmoji(2, static_test, bomb)

      expect(result).toMatch("tie")
    })

    it("maps 3 to fail", () => {
      const result = ChopResultsPresenter.rollToEmoji(3, static_test, bomb)

      expect(result).toMatch("fail")
    })
  })

  describe("with bomb modifier", () => {
    const static_test = false
    const bomb = true

    it("maps 1 to rock", () => {
      const result = ChopResultsPresenter.rollToEmoji(1, static_test, bomb)

      expect(result).toMatch("rock")
    })

    it("maps 2 to bomb", () => {
      const result = ChopResultsPresenter.rollToEmoji(2, static_test, bomb)

      expect(result).toMatch("firecracker")
    })

    it("maps 3 to scissors", () => {
      const result = ChopResultsPresenter.rollToEmoji(3, static_test, bomb)

      expect(result).toMatch("scissors")
    })
  })

  describe("with static and bomb modifier", () => {
    const static_test = true
    const bomb = true

    it("maps 1 to pass", () => {
      const result = ChopResultsPresenter.rollToEmoji(1, static_test, bomb)

      expect(result).toMatch("pass")
    })

    it("maps 2 to tie", () => {
      const result = ChopResultsPresenter.rollToEmoji(2, static_test, bomb)

      expect(result).toMatch("pass")
    })

    it("maps 3 to fail", () => {
      const result = ChopResultsPresenter.rollToEmoji(3, static_test, bomb)

      expect(result).toMatch("fail")
    })
  })
})
