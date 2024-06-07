const NwodResultsPresenter = require("./nwod-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("notateDice", () => {
  it("displays fails plain", () => {
    const raw = [2]

    const result = NwodResultsPresenter.notateDice(raw, 8, 10)

    expect(result).toEqual("2")
  })

  it("displays successes in bold", () => {
    const raw = [8]

    const result = NwodResultsPresenter.notateDice(raw, 8, 10)

    expect(result).toEqual("**8**")
  })

  it("displays n-again re-rolls in bold with a bang", () => {
    const raw = [10]

    const result = NwodResultsPresenter.notateDice(raw, 8, 10)

    expect(result).toEqual("**10!**")
  })

  it.todo("displays rote rerolls plain with a bang")
})

describe("explainExplode", () => {
  it("returns an empty string with 10", () => {
    const result = NwodResultsPresenter.explainExplode(10)

    expect(result).toEqual("")
  })

  it("returns a nope string with >10", () => {
    const result = NwodResultsPresenter.explainExplode(11)

    expect(result).toMatch("no 10-again")
  })

  it("returns a description for <10", () => {
    const result = NwodResultsPresenter.explainExplode(8)

    expect(result).toMatch("8-again")
  })
})

describe("explainThreshold", () => {
  it("returns an empty string with 8", () => {
    const result = NwodResultsPresenter.explainThreshold(8)

    expect(result).toEqual("")
  })

  it("returns a description for !=8", () => {
    const result = NwodResultsPresenter.explainThreshold(9)

    expect(result).toMatch("9 and up")
  })

  it("leaves off gte string for 10", () => {
    const result = NwodResultsPresenter.explainThreshold(10)

    expect(result).not.toMatch("and up")
  })
})

describe("explainRote", () => {
  it("returns empty string when false", () => {
    const result = NwodResultsPresenter.explainRote(false)

    expect(result).toEqual("")
  })

  it("returns a description for true", () => {
    const result = NwodResultsPresenter.explainRote(true)

    expect(result).toEqual(" with rote")
  })
})

describe("explainChance", () => {
  describe("with normal roll", () => {
    it("ignores initial 1 result", () => {
      const result = NwodResultsPresenter.explainChance(false, [1, 8, 3], 1)

      expect(result).not.toContain("failure")
    })

    it("shows the sum", () => {
      const result = NwodResultsPresenter.explainChance(false, [1, 8, 3], 1)

      expect(result).toEqual("**1**")
    })
  })

  describe("with chance roll", () => {
    it("returns dramatic failure with raw result of 1", () => {
      const result = NwodResultsPresenter.explainChance(true, [1], 0)

      expect(result).toMatch("dramatic failure")
    })

    it("returns normal sum with larger first raw result", () => {
      const result = NwodResultsPresenter.explainChance(true, [10, 1], 1)

      expect(result).toEqual("**1**")
    })
  })
})

describe("presentOne", () => {
  const defaultArgs = {
    pool: 2,
    threshold: 8,
    explode: 10,
    description: "test roll",
    raw: [[1,8]],
    summed: [0],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = NwodResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("highlights final sum", () => {
    const result = NwodResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch("**0**")
  })

  it("includes description if present", () => {
    const result = NwodResultsPresenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detailOne", () => {
  const defaultArgs = {
    pool: 3,
    threshold: 8,
    explode: 10,
    raw: [10,5,8],
  }

  it("bolds successes", () => {
    const result = NwodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("**8**")
  })

  it("includes others", () => {
    const result = NwodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("5")
  })

  it("adds exclamations to 10s", () => {
    const result = NwodResultsPresenter.detailOne(defaultArgs)

    expect(result).toMatch("**10!**")
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    pool: 2,
    threshold: 8,
    explode: 10,
    description: "test roll",
    raw: [[1,8], [4,6]],
    summed: [0, 1],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = NwodResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes description if present", () => {
    const result = NwodResultsPresenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detailMany", () => {
  const defaultArgs = {
    pool: 2,
    threshold: 8,
    explode: 10,
    raw: [10,8],
  }

  it("bolds successes", () => {
    const result = NwodResultsPresenter.detailMany(defaultArgs)

    expect(result).toMatch("**8**")
  })

  it("adds exclamations to 10s", () => {
    const result = NwodResultsPresenter.detailMany(defaultArgs)

    expect(result).toMatch("**10!**")
  })
})

describe("presentUntil", () => {
  const defaultArgs = {
    pool: 2,
    threshold: 8,
    explode: 10,
    until: 3,
    description: "test roll",
    raw: [[9,8], [4,6]],
    summed: [2, 1],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = NwodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes intermediate results", () => {
    const result = NwodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("**2**")
  })

  it("describes the target", () => {
    const result = NwodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("until 3")
  })

  it("displays the total number of rolls", () => {
    const result = NwodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("in 2 rolls")
  })

  it("displays the final total of successes reached", () => {
    const result = NwodResultsPresenter.presentUntil(defaultArgs)

    expect(result).toMatch("**3** of 3")
  })
})
