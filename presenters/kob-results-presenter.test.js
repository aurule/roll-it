const kobPresenter = require("./kob-results-presenter")
const { i18n } = require("../locales")

describe("presentOne", () => {
  const defaultArgs = {
    modifier: 0,
    sides: 6,
    description: "test roll",
    raw: [[1]],
    summed: [1],
    t: i18n.getFixedT("en-US", "commands", "kob"),
  }

  it("includes description if present", () => {
    const result = kobPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })

  it("includes the sum", () => {
    const args = {
      ...defaultArgs,
      raw: [[6, 2]],
      summed: [8],
    }

    const result = kobPresenter.presentOne(args)

    expect(result).toMatch(`8`)
  })

  it("has a breakdown", () => {
    const args = {
      ...defaultArgs,
      raw: [[6, 2]],
      summed: [8],
    }

    const result = kobPresenter.presentOne(args)

    expect(result).toMatch(`, 2`)
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    modifier: 0,
    description: "test roll",
    raw: [[1], [2]],
    summed: [1, 2],
    t: i18n.getFixedT("en-US", "commands", "kob"),
  }

  it("includes description if present", () => {
    const result = kobPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detail", () => {
  describe("when modifier is zero", () => {
    it("shows the die sides", () => {
      const result = kobPresenter.detail({ sides: 6, raw: [5], modifier: 0 })

      expect(result).toMatch("d6")
    })

    it("shows the die results", () => {
      const result = kobPresenter.detail({ sides: 6, raw: [5], modifier: 0 })

      expect(result).toMatch("[5]")
    })

    it("highlights exploding dice", () => {
      const result = kobPresenter.detail({ sides: 6, raw: [6, 1], modifier: 0 })

      expect(result).toMatch("**6**")
    })
  })

  describe("when modifier is non-zero", () => {
    it("includes the modifier", () => {
      const result = kobPresenter.detail({ sides: 6, raw: [5], modifier: 2 })

      expect(result).toMatch("+ 2")
    })
  })
})
