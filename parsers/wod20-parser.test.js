const { present } = require("../presenters/wod20-results-presenter")

const { parse } = require("./wod20-parser")

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
      difficulty: 7,
      raw: [[5, 3, 8, 2, 1]],
      summed: [0],
    })

    const result = await parse(content)

    expect(result).toMatchObject({
      pool: 5,
      difficulty: 7,
    })
  })
})

describe.each([
  [
    "single roll",
    {
      rolls: 1,
      pool: 5,
      difficulty: 7,
      raw: [[5, 3, 8, 2, 1]],
      summed: [0],
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      pool: 5,
      difficulty: 7,
      raw: [
        [5, 3, 8, 2, 1],
        [9, 4, 8, 1, 3],
      ],
      summed: [0, 1],
    },
  ],
  [
    "roll until",
    {
      rolls: 2,
      until: 1,
      pool: 5,
      difficulty: 7,
      raw: [
        [5, 3, 8, 2, 1],
        [9, 4, 8, 1, 3],
      ],
      summed: [0, 1],
    },
  ],
])("%s", (_suite, raw_opts) => {
  it("gets pool and difficulty", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result).toMatchObject({
      pool: raw_opts.pool,
      difficulty: raw_opts.difficulty,
    })
  })

  it("gets specialty if present", async () => {
    const content = present({
      ...raw_opts,
      specialty: true,
    })

    const result = await parse(content)

    expect(result.specialty).toBeTruthy()
  })

  it("skips specialty if absent", async () => {
    const content = present(raw_opts)

    const result = await parse(content)

    expect(result.specialty).toBeUndefined()
  })

  it("ignores decoy specialty", async () => {
    const content = present({
      ...raw_opts,
      description: "but I had specialty"
    })

    const result = await parse(content)

    expect(result.specialty).toBeUndefined()
  })
})

describe("single roll", () => {
  const default_opts = {
    rolls: 1,
    pool: 5,
    difficulty: 7,
    raw: [[5, 3, 8, 2, 1]],
    summed: [0],
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
    difficulty: 7,
    raw: [
      [5, 3, 8, 2, 1],
      [9, 4, 8, 1, 3],
    ],
    summed: [0, 1],
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
    until: 1,
    pool: 5,
    difficulty: 7,
    raw: [
      [5, 3, 8, 2, 1],
      [9, 4, 8, 1, 3],
    ],
    summed: [0, 1],
  }

  it("skips rolls", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.rolls).toBeUndefined()
  })

  it("gets until", async () => {
    const content = present(default_opts)

    const result = await parse(content)

    expect(result.until).toEqual(1)
  })
})
