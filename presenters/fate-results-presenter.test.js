const FateResultsPresenter = require("./fate-results-presenter")
const { i18n } = require("../locales")

describe("presentOne", () => {
  const defaultArgs = {
    description: "test roll",
    raw: [[1, 1, 2, 3]],
    summed: [-1],
    modifier: 2,
    t: i18n.getFixedT("en-US", "commands", "fate"),
  }

  it("includes the ladder word for the sum", () => {
    const result = FateResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch("Average")
  })

  it("shows the sum", () => {
    const result = FateResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch("+1")
  })

  it("includes description if present", () => {
    const result = FateResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    description: "test roll",
    raw: [
      [1, 2, 3, 3],
      [2, 1, 3, 2],
    ],
    summed: [2, 0],
    modifier: 5,
    t: i18n.getFixedT("en-US", "commands", "fate"),
  }

  it("highlights final sum", () => {
    const result = FateResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch("+7")
  })

  it("includes the ladder word for the final sum", () => {
    const result = FateResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch("Epic")
  })

  it("includes description if present", () => {
    const result = FateResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detail", () => {
  const default_raw = [1, 1, 2, 3]
  const default_modifier = 2

  it("shows the breakdown of the dice", () => {
    const result = FateResultsPresenter.detail(default_raw, default_modifier)

    expect(result).toMatch("fateneg")
    expect(result).toMatch("fatezero")
    expect(result).toMatch("fatepos")
  })

  it("shows the modifier if non-zero", () => {
    const result = FateResultsPresenter.detail(default_raw, default_modifier)

    expect(result).toMatch(" + 2")
  })

  it("excludes modifier if zero", () => {
    const result = FateResultsPresenter.detail(default_raw, 0)

    expect(result).not.toMatch(" + ")
  })
})

describe("toLadder", () => {
  it("shows the ladder name", () => {
    const result = FateResultsPresenter.toLadder(3)

    expect(result).toMatch("Good")
  })

  it("shows signed negative result", () => {
    const result = FateResultsPresenter.toLadder(-2)

    expect(result).toMatch("-2")
  })

  it("shows signed positive result", () => {
    const result = FateResultsPresenter.toLadder(3)

    expect(result).toMatch("+3")
  })
})
