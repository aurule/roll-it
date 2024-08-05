const { present } = require("../presenters/roll-formula-results-presenter")

const { parse } = require("./roll-formula-parser")

describe("with junk input", () => {
  it("errors out", async () => {
    await expect(parse("something something explosions"))
    .rejects
    .toThrow("formula")
  })
})

describe("with a valid message", () => {
  it("ignores the description", async () => {
    const content = present({
      rolls: 1,
      formula: "1d6 + 2",
      results: [{
        rolledFormula: "3 + 2",
        pools: ["1d6"],
        raw: [[3]],
        summed: [3],
      }],
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
      results: [{
        rolledFormula: "3 + 2",
        pools: ["1d6"],
        raw: [[3]],
        summed: [3],
      }]
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
        },
        {
          rolledFormula: "4 + 2",
          pools: ["1d6"],
          raw: [[4]],
          summed: [4],
        },
      ]
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("returns the formula", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.formula).toMatch("1d6 + 2")
  })
})

describe("single roll", () => {
  it("skips rolls", async () => {
    const content = present({
      rolls: 1,
      formula: "1d6 + 2",
      results: [{
        rolledFormula: "3 + 2",
        pools: ["1d6"],
        raw: [[3]],
        summed: [3],
      }]
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
        },
        {
          rolledFormula: "4 + 2",
          pools: ["1d6"],
          raw: [[4]],
          summed: [4],
        },
      ]
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
        },
        {
          rolledFormula: "4 + 2",
          pools: ["1d6"],
          raw: [[4]],
          summed: [4],
        },
      ],
      description: "5 times!",
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })
})

