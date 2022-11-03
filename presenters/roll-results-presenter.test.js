const RollResultsPresenter = require("./roll-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("presentOne", () => {
  const defaultArgs = {
    pool: 2,
    sides: 6,
    description: "test roll",
    raw: [[1,4]],
    summed: [5],
    modifier: 2,
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = RollResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("highlights final sum", () => {
    const result = RollResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch("**7**")
  })

  it("includes description if present", () => {
    const result = RollResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    pool: 2,
    sides: 6,
    description: "test roll",
    raw: [[1,4], [2,5]],
    summed: [5],
    modifier: 2,
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = RollResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("highlights final sum", () => {
    const result = RollResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch("**7**")
  })

  it("includes description if present", () => {
    const result = RollResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detail", () => {
  const defaultArgs = {
    pool: 2,
    sides: 6,
    raw: [1,4],
    modifier: 2,
  }

  it("names the dice rolled as NdM", () => {
    const result = RollResultsPresenter.detail(defaultArgs)

    expect(result).toMatch("2d6")
  })

  it("shows the breakdown of the dice", () => {
    const result = RollResultsPresenter.detail(defaultArgs)

    expect(result).toMatch("[1,4]")
  })

  it("shows the modifier if non-zero", () => {
    const result = RollResultsPresenter.detail(defaultArgs)

    expect(result).toMatch(" + 2)")
  })

  it("excludes modifier if zero", () => {
    let args = defaultArgs
    args.modifier = 0
    const result = RollResultsPresenter.detail(args)

    expect(result).not.toMatch(" + ")
    expect(result).toMatch("])")
  })
})
