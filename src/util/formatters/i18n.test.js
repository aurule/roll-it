const formatters = require("./i18n")

describe("ul", () => {
  it("prefixes with asterisks", () => {
    const list = ["first", "second", "third"]

    const output = formatters.ul(list)

    expect(output).toMatch("- first")
  })
})

describe("ol", () => {
  it("prefixes with numbers", () => {
    const list = ["first", "second", "third"]

    const output = formatters.ol(list)

    expect(output).toMatch("1. first")
  })

  it("changes number for each line", () => {
    const list = ["first", "second", "third"]

    const output = formatters.ol(list)

    expect(output).toMatch("3. third")
  })
})

describe("indented", () => {
  it("prefixes first line with a tab", () => {
    const list = ["first", "second", "third"]

    const output = formatters.indented(list)

    expect(output).toMatch("\tfirst")
  })

  it("prefixes later lines with tabs", () => {
    const list = ["first", "second", "third"]

    const output = formatters.indented(list)

    expect(output).toMatch("\tthird")
  })
})

describe("spaced", () => {
  it("joins using spaces", () => {
    const list = ["first", "second", "third"]

    const output = formatters.spaced(list)

    expect(output).toEqual("first second third")
  })
})

describe("arithmetic", () => {
  it("strips zeroes", () => {
    const list = [1, 2, 0, 4, 5]

    const output = formatters.arithmetic(list)

    expect(output).not.toMatch("0")
  })

  describe("first number", () => {
    it("is emitted as-is when positive", () => {
      const list = [1]

      const output = formatters.arithmetic(list)

      expect(output).toEqual("1")
    })

    it("is prefixed with sign when negative", () => {
      const list = [-1]

      const output = formatters.arithmetic(list)

      expect(output).toEqual("-1")
    })
  })

  describe("remaining numbers", () => {
    it("each is emitted with operator", () => {
      const list = [-1, 3, -2, 6]

      const output = formatters.arithmetic(list)

      expect(output).toEqual("-1 + 3 - 2 + 6")
    })
  })
})
