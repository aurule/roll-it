const RollFormulaResultsPresenter = require("./roll-formula-results-presenter")

describe("present", () => {
  const defaultArgs = {
    formula: "1d4 + 5",
    rolledFormula: "2 + 5",
    pools: ["1d4"],
    raw: [[2]],
    summed: [2],
    description: "test roll",
  }

  it("includes the original formula", () => {
    const result = RollFormulaResultsPresenter.present(defaultArgs)

    expect(result).toMatch("1d4 + 5")
  })

  it("includes the rolled formula", () => {
    const result = RollFormulaResultsPresenter.present(defaultArgs)

    expect(result).toMatch("2 + 5")
  })

  it("breaks down each pool in the roll", () => {
    const result = RollFormulaResultsPresenter.present(defaultArgs)

    expect(result).toMatch("2 from 1d4 [2]")
  })

  it("shows the final total", () => {
    const result = RollFormulaResultsPresenter.present(defaultArgs)

    expect(result).toMatch("**7**")
  })

  it("includes the description if present", () => {
    const result = RollFormulaResultsPresenter.present(defaultArgs)

    expect(result).toMatch("test roll")
  })
})
