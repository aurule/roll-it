const ChopResultsPresenter = require("./chop-results-presenter")

describe("presentOne", () => {
  const defaultArgs = {
    static_test: true,
    bomb: false,
    description: "test roll",
    raw: [[1]],
  }

  it("includes description if present", () => {
    const result = ChopResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })

  it("shows the result", () => {
    const result = ChopResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch("pass")
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    static_test: true,
    bomb: false,
    description: "test roll",
    raw: [[1], [2]],
  }

  it("includes description if present", () => {
    const result = ChopResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })

  it("shows all results", () => {
    const result = ChopResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch("pass")
    expect(result).toMatch("tie")
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
