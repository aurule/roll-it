const WodResultsPresenter = require("./wod20-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("formatSuccesses", () => {
  it("returns botch for negative totals", () => {
    const result = WodResultsPresenter.formatSuccesses(-2)

    expect(result).toEqual("botch")
  })

  it("returns the number for positive totals", () => {
    const result = WodResultsPresenter.formatSuccesses(2)

    expect(result).toEqual("2")
  })

  it("returns the number for zero totals", () => {
    const result = WodResultsPresenter.formatSuccesses(0)

    expect(result).toEqual("0")
  })
})

describe("presentOne", () => {
  const defaultArgs = {
    pool: 2,
    difficulty: 6,
    specialty: false,
    description: "test roll",
    raw: [[1,8]],
    summed: [0],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = WodResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("highlights final sum", () => {
    const result = WodResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch("**0**")
  })

  it("includes description if present", () => {
    const result = WodResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detailOne", () => {
  const defaultArgs = {
    pool: 3,
    difficulty: 6,
    specialty: false,
    raw: [1,5,8],
  }

  it("includes difficulty", () => {
    const result = WodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("diff 6")
  })

  it("strikes 1s", () => {
    const result = WodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("~~1~~")
  })

  it("bolds successes", () => {
    const result = WodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("**8**")
  })

  it("includes others", () => {
    const result = WodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("5")
  })

  describe("with specialty", () => {
    const defaultArgs = {
      pool: 2,
      difficulty: 6,
      specialty: true,
      raw: [1,10],
    }

    it("notes specialty rule is applied", () => {
      const result = WodResultsPresenter.detailOne(defaultArgs)

      expect(result).toMatch("specialty")
    })

    it("adds exclamations to 10s", () => {
      const result = WodResultsPresenter.detailOne(defaultArgs)

      expect(result).toMatch("**10!**")
    })
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    pool: 2,
    difficulty: 6,
    specialty: false,
    description: "test roll",
    raw: [[1,8], [4,6]],
    summed: [0, 1],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = WodResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes description if present", () => {
    const result = WodResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })

  it("includes the difficulty", () => {
    const result = WodResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`diff 6`)
  })

  it("notes specialty rule is applied if present", () => {
    let args = defaultArgs
    args.specialty = true
    const result = WodResultsPresenter.presentMany(args)

    expect(result).toMatch("specialty")
  })
})

describe("detailMany", () => {
  const defaultArgs = {
    pool: 2,
    difficulty: 6,
    specialty: false,
    raw: [1,8],
  }

  it("strikes 1s", () => {
    const result = WodResultsPresenter.detailMany(defaultArgs)

    expect(result).toMatch("~~1~~")
  })

  it("bolds successes", () => {
    const result = WodResultsPresenter.detailMany(defaultArgs)

    expect(result).toMatch("**8**")
  })

  describe("with specialty", () => {
    const defaultArgs = {
      pool: 2,
      difficulty: 6,
      specialty: true,
      raw: [1,10],
    }

    it("adds exclamations to 10s", () => {
      const result = WodResultsPresenter.detailMany(defaultArgs)

      expect(result).toMatch("**10!**")
    })
  })
})

describe("presentUntil", () => {
  const defaultArgs = {
    pool: 2,
    difficulty: 6,
    specialty: false,
    until: 3,
    description: "test roll",
    raw: [[9,8], [4,6]],
    summed: [2, 1],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = WodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes intermediate results", () => {
    const result = WodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("**2**")
  })

  it("describes the target", () => {
    const result = WodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("until 3")
  })

  it("displays the total number of rolls", () => {
    const result = WodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("in 2 rolls")
  })

  it("displays the final total of successes reached", () => {
    const result = WodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("**3** of 3")
  })
})
