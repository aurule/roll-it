const SingletonPresenter = require("./singleton-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("presentOne", () => {
  const defaultArgs = {
    modifier: 0,
    description: "test roll",
    raw: [[1]],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = SingletonPresenter.presentOne(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes description if present", () => {
    const result = SingletonPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    modifier: 0,
    description: "test roll",
    raw: [[1], [2]],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = SingletonPresenter.presentMany(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes description if present", () => {
    const result = SingletonPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detail", () => {
  describe("when modifier is zero", () => {
    it("bolds the final result", () => {
      const result = SingletonPresenter.detail(5, 0)

      expect(result).toMatch("**5**")
    })

    it("has no breakdown", () => {
      const result = SingletonPresenter.detail(5, 0)

      expect(result).not.toMatch("(")
    })
  })

  describe("when modifier is non-zero", () => {
    it("bolds the final result", () => {
      const result = SingletonPresenter.detail(5, 3)

      expect(result).toMatch("**8**")
    })

    it("includes breakdown", () => {
      const result = SingletonPresenter.detail(5, 3)

      expect(result).toMatch("(")
    })
  })
})
