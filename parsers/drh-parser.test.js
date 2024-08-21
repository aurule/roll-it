const { Collection } = require("discord.js")

const { present } = require("../presenters/drh-results-presenter")
const { DrhPool } = require("../util/rolls/drh-pool")

const { parse } = require("./drh-parser")

describe("with junk input", () => {
  it("returns an empty object", async () => {
    await expect(parse("something something explosions")).rejects.toThrow("discipline")
  })
})

describe("minimal output", () => {
  it("extracts the discipline and pain pools", async () => {
    const content = present({
      tests: [
        new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
      ],
      rolls: 1,
    })

    const result = await parse(content)

    expect(result).toMatchObject({
      discipline: 3,
      pain: 2,
    })
  })
})

describe.each([
  [
    "single roll",
    {
      tests: [
        new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["madness", new DrhPool("madness", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[6, 1]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
      ],
      rolls: 1,
    },
  ],
  [
    "multiple rolls",
    {
      tests: [
        new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["madness", new DrhPool("madness", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[6, 1]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
        new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["madness", new DrhPool("madness", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[6, 1]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
      ],
      rolls: 2,
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("gets the discipline pool", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.discipline).toEqual(3)
  })

  it("gets the pain pool", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.pain).toEqual(2)
  })

  it("gets the madness pool when present", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.madness).toEqual(3)
  })

  it("gets the exhaustion pool when present", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.exhaustion).toEqual(2)
  })

  it("gets the talent when present", async () => {
    const content = present({
      ...raw_opts,
      talent: "minor",
    })

    const result = await parse(content)

    expect(result.talent).toEqual("minor")
  })
})

describe("single roll", () => {
  it("skips rolls", async () => {
    const content = present({
      tests: [
        new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
      ],
      rolls: 1,
    })

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })
})

describe("multiple rolls", () => {
  it("gets rolls", async () => {
    const content = present({
      tests: [
        new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
        new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
      ],
      rolls: 2,
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("ignores decoy rolls in description", async () => {
    const content = present({
      tests: [
        new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
        new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[6, 1]])],
        ]),
      ],
      rolls: 2,
      description: "5 times"
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })
})
