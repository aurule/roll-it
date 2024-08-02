const { present } = require("../presenters/d20-results-presenter")

const { parse } = require("./d20-parser")

describe("with junk input", () => {
  it("returns an empty object", async () => {
    const result = await parse("this is some garbage")

    expect(JSON.stringify(result)).toMatch("{}")
  })
})

describe("minimal output", () => {
  it("returns an empty object", async () => {
    const content = present({
      rolls: 1,
      raw: [[3]],
      picked: [{indexes: [0]}],
    })

    const result = await parse(content)

    expect(JSON.stringify(result)).toMatch("{}")
  })
})

describe.each([
  [
    "single roll",
    {
      rolls: 1,
      raw: [[3]],
      picked: [{indexes: [0]}],
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      raw: [[3], [4]],
      picked: [
        {indexes: [0]},
        {indexes: [0]},
      ],
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

  it("gets keep highest if present", async () => {
    const content = present({
      ...raw_opts,
      keep: "highest",
    })

    const result = await parse(content)

    expect(result.keep).toMatch("highest")
  })

  it("gets keep lowest if present", async () => {
    const content = present({
      ...raw_opts,
      keep: "lowest",
    })

    const result = await parse(content)

    expect(result.keep).toMatch("lowest")
  })

  it("skips keep if not present", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.keep).toBeUndefined()
  })
})

describe("single roll", () => {
  it("skips rolls", async () => {
    const content = present({
      rolls: 1,
      raw: [[3]],
      picked: [{indexes: [0]}],
    })

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })
})

describe("multiple rolls", () => {
  it("gets rolls", async () => {
    const content = present({
      rolls: 2,
      raw: [[3], [4]],
      picked: [
        {indexes: [0]},
        {indexes: [0]},
      ],
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("ignores decoy rolls in description", async () => {
    const content = present({
      rolls: 2,
      raw: [[3], [4]],
      description: "5 times!",
      picked: [
        {indexes: [0]},
        {indexes: [0]},
      ],
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })
})
