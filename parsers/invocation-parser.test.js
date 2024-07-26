const { parse } = require("./invocation-parser")

describe("with junk input", () => {
  it("errors early", () => {
    const result = parse("something something explosions")

    const error_messages = result.errors.join("\b")
    expect(error_messages).toMatch("invalid")
  })
})

describe("with an unknown command", () => {
  it("errors early", () => {
    const result = parse("/nopealope pool:3")

    const error_messages = result.errors.join("\b")
    expect(error_messages).toMatch("cannot save")
  })
})

describe("with a non-savable command", () => {
  it("errors early", () => {
    const result = parse("/chop")

    const error_messages = result.errors.join("\b")
    expect(error_messages).toMatch("cannot save")
  })
})

describe("with a savable command", () => {
  describe("with invalid options", () => {
    it("returns the command name", () => {
      const result = parse("/roll pool:3")

      expect(result.command).toEqual("roll")
    })

    it("returns validation errors", () => {
      const result = parse("/roll pool:3")

      expect(result.errors.length).toBeTruthy()
    })
  })

  describe("with valid options", () => {
    it("returns the command name", () => {
      const result = parse("/roll pool:3 sides:6 modifier:2")

      expect(result.command).toEqual("roll")
    })

    it("returns converted options object", () => {
      const result = parse("/roll pool:3 sides:6 modifier:2")

      expect(result.options).toMatchObject({
        pool: 3,
        sides: 6,
        modifier: 2,
      })
    })
  })
})

describe("spot checks", () => {
  it.each([
    ["/d20", {}],
    ["/d20 modifier:4", {modifier: 4}],
    ["/fate", {}],
    ["/fate modifier:3", {modifier: 3}],
    ["/nwod pool:6", {pool: 6}],
    ["/nwod pool:6 explode:9 threshold:9 rote:true", {
      pool: 6,
      explode: 9,
      threshold: 9,
      rote: true,
    }],
    ["/roll-formula formula:3d6 + 1d8 + 5", {
      formula: "3d6 + 1d8 + 5"
    }],
    ["/roll pool:2 sides:12 modifier:18", {
      pool: 2,
      sides: 12,
      modifier: 18,
    }],
    ["/wod20 pool:7 difficulty:8 specialty:true", {
      pool: 7,
      difficulty: 8,
      specialty: true,
    }],
  ])("parses %s", (invocation, expected_options) => {
    const result = parse(invocation)

    expect(result.options).toMatchObject(expected_options)
  })
})
