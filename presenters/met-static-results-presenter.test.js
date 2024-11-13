const { pretty, presentOne, presentMany } = require("./met-static-results-presenter")

describe("pretty", () => {
  it("adds emoji", () => {
    const result = pretty("paper")

    expect(result).toMatch(":")
  })

  describe("with request", () => {
    it("adds random if rand", () => {
      const result = pretty("paper", "rand")

      expect(result).toMatch("random")
    })

    it("adds bomb note if bomb", () => {
      const result = pretty("rock", "rand-bomb")

      expect(result).toMatch("w/bomb")
    })
  })
})

describe("presentOne", () => {
  const default_opts = {
    rolls: 1,
    thrown: ["bomb"],
    vs: ["paper"],
    compared: ["lose"],
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

    expect(result).toMatch("bomb _vs_")
  })

  describe("with no opponent", () => {
    it("shows the user's symbol", () => {
      const result = presentOne({
        ...default_opts,
        vs: ["none"],
        compared: [""],
      })

      expect(result).toMatch("bomb")
    })

    it("does not show a comparison", () => {
      const result = presentOne({
        ...default_opts,
        vs: ["none"],
        compared: [""],
      })

      expect(result).not.toMatch("vs")
    })
  })

  describe("random throws", () => {
    it("notes random user symbol", () => {
      const result = presentOne({
        ...default_opts,
        throw_request: "rand",
        thrown: ["rock"],
      })

      expect(result).toMatch("random")
    })

    it("notes random user symbol with bomb", () => {
      const result = presentOne({
        ...default_opts,
        throw_request: "rand-bomb",
        thrown: ["rock"],
      })

      expect(result).toMatch("bomb")
    })

    it("notes random vs symbol", () => {
      const result = presentOne({
        ...default_opts,
        throw_request: "rock",
        thrown: ["rock"],
        vs_request: "rand",
        vs: ["paper"],
      })

      expect(result).toMatch("random")
    })

    it("notes random vs symbol with bomb", () => {
      const result = presentOne({
        ...default_opts,
        throw_request: "rock",
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
    compared: ["lose", "tie"],
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

    expect(result).toMatch("rock _vs_")
    expect(result).toMatch("scissors _vs_")
  })

  describe("with no opponent", () => {
    it("shows the user's symbols", () => {
      const result = presentMany({
        ...default_opts,
        vs: ["none", "none"],
        compared: ["", ""],
      })

      expect(result).toMatch("rock")
      expect(result).toMatch("scissors")
    })

    it("does not show comparisons", () => {
      const result = presentMany({
        ...default_opts,
        vs: ["none", "none"],
        compared: ["", ""],
      })

      expect(result).not.toMatch("vs")
    })
  })
})
