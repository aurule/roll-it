const { pretty, presentOne, presentMany } = require("./met-static-results-presenter")

describe("pretty", () => {
  it("adds emoji", () => {
    const result = pretty("paper")

    expect(result).toMatch(":")
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
    const result = presentOne({...default_opts, description: "just a test"})

    expect(result).toMatch("just a test")
  })

  it("shows result", () => {
    const result = presentOne(default_opts)

    expect(result).toMatch("lose")
  })

  it("shows breakdown", () => {
    const result = presentOne(default_opts)

    expect(result).toMatch("bomb vs")
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
    const result = presentMany({...default_opts, description: "just a test"})

    expect(result).toMatch("userMention")
  })

  it("shows each result", () => {
    const result = presentMany(default_opts)

    expect(result).toMatch("lose")
    expect(result).toMatch("tie")
  })

  it("shows each breakdown", () => {
    const result = presentMany(default_opts)

    expect(result).toMatch("rock vs")
    expect(result).toMatch("scissors vs")
  })
})
