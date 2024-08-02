const { present } = require("../presenters/nwod-results-presenter")

const { parse } = require("./nwod-parser")

describe("with junk input", () => {
  it("errors out", async () => {
    await expect(parse("something something explosions"))
    .rejects
    .toThrow("pool")
  })
})

describe("minimal output", () => {
  it("captures pool and difficulty", async () => {
    const content = present({
      rolls: 1,
      pool: 5,
      threshold: 8,
      explode: 10,
      raw: [[5, 3, 8, 2, 1]],
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
      threshold: 8,
      explode: 10,
      raw: [[5, 3, 8, 2, 1]],
      summed: [1],
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      pool: 5,
      threshold: 8,
      explode: 10,
      raw: [
        [5, 3, 8, 2, 1],
        [9, 4, 8, 1, 3],
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
      threshold: 8,
      explode: 10,
      raw: [
        [5, 3, 8, 2, 1],
        [9, 4, 8, 1, 3],
      ],
      summed: [1, 2],
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("gets pool and difficulty", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.pool).toEqual(raw_opts.pool)
  })

  it("gets normal explode", async () => {
    const content = present({
      ...raw_opts,
      explode: 9,
    })

    const result = await parse(content)

    expect(result.explode).toEqual(9)
  })

  it("gets no explode", async () => {
    const content = present({
      ...raw_opts,
      explode: 11,
    })

    const result = await parse(content)

    expect(result.explode).toEqual(11)
  })

  it("gets threshold", async () => {
    const content = present({
      ...raw_opts,
      threshold: 9,
    })

    const result = await parse(content)

    expect(result.threshold).toEqual(9)
  })

  it("gets rote", async () => {
    const content = present({
      ...raw_opts,
      rote: true,
    })

    const result = await parse(content)

    expect(result.rote).toBeTruthy()
  })
})

describe("single roll", () => {
  const default_opts = {
    rolls: 1,
    pool: 5,
    threshold: 8,
    explode: 10,
    raw: [[5, 3, 8, 2, 1]],
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
    threshold: 8,
    explode: 10,
    raw: [
      [5, 3, 8, 2, 1],
      [9, 4, 8, 1, 3],
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
    threshold: 8,
    explode: 10,
    raw: [
      [5, 3, 8, 2, 1],
      [9, 4, 8, 1, 3],
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
