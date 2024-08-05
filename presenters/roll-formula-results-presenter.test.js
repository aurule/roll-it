const roll_formula_presenter = require("./roll-formula-results-presenter")

describe("presentOne", () => {
  const defaultArgs = {
    formula: "1d4 + 5",
    description: "test roll",
    results: [{
      rolledFormula: "2 + 5",
      pools: ["1d4"],
      raw: [[2]],
      summed: [2],
    }]
  }

  it("includes the original formula", () => {
    const result = roll_formula_presenter.presentOne(defaultArgs)

    expect(result).toMatch("1d4 + 5")
  })

  it("includes the rolled formula", () => {
    const result = roll_formula_presenter.presentOne(defaultArgs)

    expect(result).toMatch("2 + 5")
  })

  it("breaks down each pool in the roll", () => {
    const result = roll_formula_presenter.presentOne(defaultArgs)

    expect(result).toMatch("2 from 1d4 [2]")
  })

  it("shows the final total", () => {
    const result = roll_formula_presenter.presentOne(defaultArgs)

    expect(result).toMatch("**7**")
  })

  it("includes the description if present", () => {
    const result = roll_formula_presenter.presentOne(defaultArgs)

    expect(result).toMatch("test roll")
  })

  it("warns on disabled mathjs function", () => {
    const options = {
      ...defaultArgs,
      formula: "evaluate(1d4 + 3) + 3",
    }
    options.results[0].rolledFormula = "evaluate(4 + 3) + 3"

    const result = roll_formula_presenter.presentOne(options)

    expect(result).toMatch("evaluate is disabled")
  })
})
