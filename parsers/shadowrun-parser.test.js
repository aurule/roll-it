const { present } = require("../presenters/shadowrun-results-presenter")

const { parse } = require("./shadowrun-parser")

describe("with junk input", () => {
  it("errors out", async () => {
    await expect(parse("something something explosions")).rejects.toThrow("pool")
  })
})

describe("minimal output", () => {
  it("captures pool", async () => {
    const content = present({
      rolls: 1,
      pool: 5,
      raw: [[5, 3, 4, 2, 1]],
      summed: [1],
    })

    const result = await parse(content)

    expect(result).toMatchObject({
      pool: 5,
    })
  })
})

describe.each([
  [
    "single roll",
    {
      rolls: 1,
      pool: 5,
      raw: [[5, 3, 4, 2, 1]],
      summed: [1],
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      pool: 5,
      raw: [
        [5, 3, 4, 2, 1],
        [6, 4, 5, 1, 3],
      ],
      summed: [1, 2],
    },
  ],
  [
    "roll until",
    {
      rolls: 2,
      until: 2,
      pool: 5,
      raw: [
        [5, 3, 4, 2, 1],
        [6, 4, 5, 1, 3],
      ],
      summed: [1, 2],
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("gets pool", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.pool).toEqual(raw_opts.pool)
  })

  it("gets edge", async () => {
    const content = present({
      ...raw_opts,
      edge: true,
    })

    const result = await parse(content)

    expect(result.edge).toBeTruthy()
  })
})

describe("single roll", () => {
  const default_opts = {
    rolls: 1,
    pool: 5,
    raw: [[5, 3, 4, 2, 1]],
    summed: [1],
  }

  it("skips rolls", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })

  it("skips until", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.until).toBeUndefined()
  })
})

describe("multiple rolls", () => {
  const default_opts = {
    rolls: 2,
    pool: 5,
    raw: [
      [5, 3, 4, 2, 1],
      [6, 4, 5, 1, 3],
    ],
    summed: [1, 2],
  }

  it("gets rolls", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("ignores decoy rolls in description", async () => {
    const content = present({
      ...default_opts,
      description: "5 times!",
    })

    const result = await parse(content)

    expect(result.rolls).toEqual(2)
  })

  it("skips until", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.until).toBeUndefined()
  })
})

describe("roll until", () => {
  const default_opts = {
    rolls: 2,
    until: 2,
    pool: 5,
    raw: [
      [5, 3, 4, 2, 1],
      [6, 4, 5, 1, 3],
    ],
    summed: [1, 2],
  }

  it("skips rolls", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })

  it("gets until", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.until).toEqual(2)
  })
})
