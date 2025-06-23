const { presentOne, presentMany } = require("./met-static-results-presenter")
const { i18n } = require("../../locales")

describe("presentOne", () => {
  const default_opts = {
    rolls: 1,
    thrown: ["bomb"],
    vs_request: "rand",
    vs: ["paper"],
    compared: ["lose"],
    t: i18n.getFixedT("en-US", "commands", "met.static"),
  }

  it("includes user mention", () => {
    const result = presentOne(default_opts)

    expect(result).toMatch("userMention")
  })

  it("includes description if present", () => {
    const result = presentOne({ ...default_opts, description: "just a test" })

    expect(result).toMatch("just a test")
  })

  it("shows result", () => {
    const result = presentOne(default_opts)

    expect(result).toMatch("lose")
  })

  it("shows breakdown", () => {
    const result = presentOne(default_opts)

    expect(result).toMatch("bomb *vs*")
  })

  describe("with no opponent", () => {
    it("shows the user's symbol", () => {
      const result = presentOne({
        ...default_opts,
        vs_request: "none",
        vs: ["none"],
        compared: [""],
      })

      expect(result).toMatch("bomb")
    })

    it("does not show a comparison", () => {
      const result = presentOne({
        ...default_opts,
        vs_request: "none",
        vs: ["none"],
        compared: [""],
      })

      expect(result).not.toMatch("vs")
    })
  })

  describe("random throws", () => {
    it("notes random vs symbol", () => {
      const result = presentOne({
        ...default_opts,
        thrown: ["rock"],
        vs_request: "rand",
        vs: ["paper"],
      })

      expect(result).toMatch("random")
    })

    it("notes random vs symbol with bomb", () => {
      const result = presentOne({
        ...default_opts,
        thrown: ["rock"],
        vs_request: "rand-bomb",
        vs: ["paper"],
      })

      expect(result).toMatch("bomb")
    })
  })
})

describe("presentMany", () => {
  const default_opts = {
    rolls: 2,
    thrown: ["rock", "scissors"],
    vs: ["paper", "scissors"],
    vs_request: "rand",
    compared: ["lose", "tie"],
    t: i18n.getFixedT("en-US", "commands", "met.static"),
  }

  it("includes user mention", () => {
    const result = presentMany(default_opts)

    expect(result).toMatch("userMention")
  })

  it("includes description if present", () => {
    const result = presentMany({ ...default_opts, description: "just a test" })

    expect(result).toMatch("userMention")
  })

  it("shows each result", () => {
    const result = presentMany(default_opts)

    expect(result).toMatch("lose")
    expect(result).toMatch("tie")
  })

  it("shows each breakdown", () => {
    const result = presentMany(default_opts)

    expect(result).toMatch("rock *vs*")
    expect(result).toMatch("scissors *vs*")
  })

  describe("with no opponent", () => {
    it("shows the user's symbols", () => {
      const result = presentMany({
        ...default_opts,
        vs_request: "none",
        vs: ["none", "none"],
        compared: ["", ""],
      })

      expect(result).toMatch("rock")
      expect(result).toMatch("scissors")
    })

    it("does not show comparisons", () => {
      const result = presentMany({
        ...default_opts,
        vs_request: "none",
        vs: ["none", "none"],
        compared: ["", ""],
      })

      expect(result).not.toMatch("vs")
    })
  })
})
