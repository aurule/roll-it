const roll_formula_presenter = require("./formula-results-presenter")
const { i18n } = require("../../locales")

describe("presentOne", () => {
  const default_opts = {
    formula: "1d4 + 5",
    description: "test roll",
    results: [
      {
        rolledFormula: "2 + 5",
        pools: ["1d4"],
        raw: [[2]],
        summed: [2],
        labels: [undefined],
      },
    ],
    t: i18n.getFixedT("en-US", "commands", "formula"),
  }

  it("includes the original formula", () => {
    const result = roll_formula_presenter.presentOne(default_opts)

    expect(result).toMatch("1d4 + 5")
  })

  it("includes the rolled formula", () => {
    const result = roll_formula_presenter.presentOne(default_opts)

    expect(result).toMatch("2 + 5")
  })

  it("breaks down each pool in the roll", () => {
    const result = roll_formula_presenter.presentOne(default_opts)

    expect(result).toMatch("2 from 1d4 [2]")
  })

  it("shows the final total", () => {
    const result = roll_formula_presenter.presentOne(default_opts)

    expect(result).toMatch("**7**")
  })

  it("includes the description if present", () => {
    const result = roll_formula_presenter.presentOne(default_opts)

    expect(result).toMatch("test roll")
  })

  it("warns on disabled mathjs function", () => {
    const options = {
      ...default_opts,
      formula: "evaluate(1d4 + 3) + 3",
    }
    options.results[0].rolledFormula = "evaluate(4 + 3) + 3"

    const result = roll_formula_presenter.presentOne(options)

    expect(result).toMatch("evaluate is disabled")
  })
})

describe("presentMany", () => {
  const default_opts = {
    rolls: 2,
    formula: "1d6 + 2",
    results: [
      {
        rolledFormula: "3 + 2",
        pools: ["1d6"],
        raw: [[3]],
        summed: [3],
        labels: [undefined],
      },
      {
        rolledFormula: "4 + 2",
        pools: ["1d6"],
        raw: [[4]],
        summed: [4],
        labels: [undefined],
      },
    ],
    t: i18n.getFixedT("en-US", "commands", "formula"),
  }

  it("includes the original formula", () => {
    const result = roll_formula_presenter.presentMany(default_opts)

    expect(result).toMatch("1d6 + 2")
  })

  it("includes each rolled formula", () => {
    const result = roll_formula_presenter.presentMany(default_opts)

    expect(result).toMatch("3 + 2")
    expect(result).toMatch("4 + 2")
  })

  it("breaks down each pool in a roll", () => {
    const result = roll_formula_presenter.presentMany(default_opts)

    expect(result).toMatch("3 from 1d6")
  })

  it("shows each final total", () => {
    const result = roll_formula_presenter.presentMany(default_opts)

    expect(result).toMatch("5")
    expect(result).toMatch("6")
  })

  it("includes the description if present", () => {
    const options = {
      ...default_opts,
      description: "test roll",
    }
    const result = roll_formula_presenter.presentMany(options)

    expect(result).toMatch("test roll")
  })

  it("warns on disabled mathjs function", () => {
    const options = {
      ...default_opts,
      formula: "evaluate(1d4 + 3) + 3",
    }
    options.results[0].rolledFormula = "evaluate(4 + 3) + 3"

    const result = roll_formula_presenter.presentMany(options)

    expect(result).toMatch("evaluate is disabled")
  })
})

describe("limitedEvaluate", () => {
  it.concurrent.each([["import"], ["createUnit"], ["evaluate"], ["parse"], ["simplify"], ["derivative"]])(
    "disables %s",
    async (fn_name) => {
      expect(() => {
        roll_formula_presenter.limitedEvaluate(`${fn_name}()`)
      }).toThrow(`${fn_name} is disabled`)
    },
  )
})

describe("detail", () => {
  const default_opts = {
    pools: ["1d3", "1d4"],
    raw: [[2], [1]],
    summed: [2, 1],
    labels: [undefined, undefined],
    t: i18n.getFixedT("en-US", "commands", "formula"),
  }

  it("shows every pool", () => {
    const result = roll_formula_presenter.detail(default_opts)

    expect(result).toMatch("1d3")
    expect(result).toMatch("1d4")
  })

  it("shows the sum", () => {
    const result = roll_formula_presenter.detail(default_opts)

    expect(result).toMatch("2")
  })

  it("shows the label if present", () => {
    const opts = {
      ...default_opts,
      labels: ["thing", undefined],
    }
    const result = roll_formula_presenter.detail(opts)

    expect(result).toMatch("thing")
  })

  it("shows raw die results", () => {
    const result = roll_formula_presenter.detail(default_opts)

    expect(result).toMatch("[2]")
  })
})
