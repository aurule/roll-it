const { present } = require("../presenters/roll-results-presenter")

const { parse } = require("./roll-parser")

describe("with junk input", () => {
  it("errors out", async () => {
    await expect(parse("something something explosions"))
    .rejects
    .toThrow("pool")
  })
})

describe("minimal output", () => {
  it("gets the pool and sides", async () => {
    const content = present({
      rolls: 1,
      pool: 1,
      sides: 6,
      raw: [[3]],
      summed: [3],
    })

    const result = await parse(content)

    expect(result).toMatchObject({
      pool: 1,
      sides: 6,
    })
  })
})

describe.each([
  [
    "single roll",
    {
      rolls: 1,
      pool: 1,
      sides: 6,
      raw: [[3]],
      summed: [3],
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      pool: 1,
      sides: 6,
      raw: [[3], [2]],
      summed: [3, 2],
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("gets modifier if present", async () => {
    const content = present({
      ...raw_opts,
      modifier: 2,
    })

    const result = await parse(content)

    expect(result.modifier).toEqual(2)
  })

  it("captures negative modifier", async () => {
    const content = present({
      ...raw_opts,
      modifier: -2,
    })

    const result = await parse(content)

    expect(result.modifier).toEqual(-2)
  })

  it("skips modifier if not present", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.modifier).toBeUndefined()
  })

  it("ignores decoy modifier in description", async () => {
    const content = present({
      ...raw_opts,
      modifier: 2,
      description: "(I wanted a 5)",
    })

    const result = await parse(content)

    expect(result.modifier).toEqual(2)
  })
})

describe("single roll", () => {
  it("skips rolls", async () => {
    const content = present({
      rolls: 1,
      pool: 1,
      sides: 6,
      raw: [[3]],
      summed: [3],
    })

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })
})

describe("multiple rolls", () => {
  it("gets rolls", async () => {
    const content = present({
      rolls: 2,
      pool: 1,
      sides: 6,
      raw: [[3], [2]],
      summed: [3, 2],
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("ignores decoy rolls in description", async () => {
    const content = present({
      rolls: 2,
      pool: 1,
      sides: 6,
      raw: [[3], [2]],
      summed: [3, 2],
      description: "5 times!",
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })
})
