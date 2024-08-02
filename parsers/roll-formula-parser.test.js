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
  it("returns the formula", async () => {
    const content = present({
      formula: "1d6 + 2",
      rolledFormula: "3 + 2",
      pools: ["1d6"],
      raw: [[3]],
      summed: [3],
    })

    const result = await parse(content)

    expect(result.formula).toMatch("1d6 + 2")
  })

  it("ignores the description", async () => {
    const content = present({
      formula: "1d6 + 2",
      rolledFormula: "3 + 2",
      pools: ["1d6"],
      raw: [[3]],
      summed: [3],
      description: "I meant to roll `5d8 + 20`",
    })

    const result = await parse(content)

    expect(result.formula).toMatch("1d6 + 2")
  })
})
/*
   * @param  {String}     options.formula       Text of the original formula
   * @param  {String}     options.rolledFormula Text of the formula after generating dice results
   * @param  {Array<String>} options.pools      Array of descriptions for dice pools rolled
   * @param  {Array<Array<Int>>} options.raw    Array of arrays with ints representing the roll for each pool
   * @param  {Array<Int>} options.summed        Array of summed dice rolls
   * @param  {String}     options.description   Text describing the roll
   * @return {String}                           String describing the roll results
  present: ({ formula, rolledFormula, pools, raw, summed, description, userFlake }) => {
    */
