const helpers = require("./parser-helpers")

describe("parseValueOption", () => {
  it("with match, returns group value", () => {
    const re = /(?<test>\w+) other/
    const content = "and other"

    const result = helpers.parseValueOption(re, content)

    expect(result).toEqual("and")
  })

  it("without match, returns undefined", () => {
    const re = /(?<test>\w+) other/
    const content = "and nope"

    const result = helpers.parseValueOption(re, content)

    expect(result).toBeUndefined()
  })
})

describe("parseModifierOption", () => {
  it("with match and positive operator, returns value", () => {
    const content = "5 + 3)"

    const result = helpers.parseModifierOption(content)

    expect(result).toEqual(3)
  })

  it("with match and negative operator, returns negative value", () => {
    const content = "5 - 3)"

    const result = helpers.parseModifierOption(content)

    expect(result).toEqual(-3)
  })

  it("with an override, parses with that instead", () => {
    const re = /(?<operator>\+|\-) (?<modifier>\d+)/
    const content = "5 + 3"

    const result = helpers.parseModifierOption(content, re)

    expect(result).toEqual(3)
  })

  it("without match, returns undefined", () => {
    const content = "5 + 3"

    const result = helpers.parseModifierOption(content)

    expect(result).toBeUndefined()
  })
})

describe("parseRollsOption", () => {
  it("with match, returns rolls value", () => {
    const content = "5 times"

    const result = helpers.parseRollsOption(content)

    expect(result).toEqual(5)
  })

  it("without match, returns undefined", () => {
    const content = "5 nopes"

    const result = helpers.parseRollsOption(content)

    expect(result).toBeUndefined()
  })
})

describe("parseBooleanOption", () => {
  it("with match, returns true", () => {
    const re = /test/
    const content = "testing"

    const result = helpers.parseBooleanOption(re, content)

    expect(result).toBeTruthy()
  })

  it("without match, returns undefined", () => {
    const re = /test/
    const content = "nopealope"

    const result = helpers.parseBooleanOption(re, content)

    expect(result).toBeUndefined()
  })
})

describe("validateOptions", () => {
  it("with valid options, returns sanitized values", async () => {
    const command = require("../commands/nwod")
    const options = {
      pool: "6",
    }

    const result = await helpers.validateOptions(options, command)

    expect(result).toMatchObject({
      pool: 6
    })
  })

  it("with invalid options, throws error", async () => {
    const command = require("../commands/nwod")
    const options = {
      pool: "0",
    }

    await expect(helpers.validateOptions(options, command))
      .rejects
      .toThrow()
  })
})
