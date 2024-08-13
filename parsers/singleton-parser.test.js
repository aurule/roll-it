const { present } = require("../presenters/singleton-results-presenter")

const { parse } = require("./singleton-parser")

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
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      raw: [[3], [4]],
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
      raw: [[3]],
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
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("ignores decoy rolls in description", async () => {
    const content = present({
      rolls: 2,
      raw: [[3], [4]],
      description: "5 times!",
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })
})
