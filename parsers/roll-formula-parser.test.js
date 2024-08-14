const { present } = require("../presenters/roll-formula-results-presenter")

const { parse } = require("./roll-formula-parser")

describe("with junk input", () => {
  it("errors out", async () => {
    await expect(parse("something something explosions")).rejects.toThrow("formula")
  })
})

describe("with a valid message", () => {
  it("ignores the description", async () => {
    const content = present({
      rolls: 1,
      formula: "1d6 + 2",
      results: [
        {
          rolledFormula: "3 + 2",
          pools: ["1d6"],
          raw: [[3]],
          summed: [3],
          labels: [undefined],
        },
      ],
      description: "I meant to roll `5d8 + 20`",
    })

    const result = await parse(content)

    expect(result.formula).toMatch("1d6 + 2")
  })
})

describe.each([
  [
    "single roll",
    {
      rolls: 1,
      formula: "1d6 + 2",
      results: [
        {
          rolledFormula: "3 + 2",
          pools: ["1d6"],
          raw: [[3]],
          summed: [3],
          labels: [undefined],
        },
      ],
    },
  ],
  [
    "multiple rolls",
    {
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
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("returns the formula", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.formula).toMatch("1d6 + 2")
  })

  it("returns a formula with labels", async () => {
    const opts = {
      ...raw_opts,
      formula: '1d6"test" + 2',
    }
    opts.results[0].labels = "test"
    const content = present(opts)

    const result = await parse(content)

    expect(result.formula).toMatch(opts.formula)
  })
})

describe("single roll", () => {
  it("skips rolls", async () => {
    const content = present({
      rolls: 1,
      formula: "1d6 + 2",
      results: [
        {
          rolledFormula: "3 + 2",
          pools: ["1d6"],
          raw: [[3]],
          summed: [3],
          labels: [undefined],
        },
      ],
    })

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })
})

describe("multiple rolls", () => {
  it("gets rolls", async () => {
    const content = present({
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
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("ignores decoy rolls in description", async () => {
    const content = present({
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
      description: "5 times!",
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })
})
