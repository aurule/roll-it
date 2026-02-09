import { ul, ol, indented, spaced, arithmetic } from "./i18n.js"

describe("i18n formatting helpers", () => {
  describe("ul", () => {
    it("prefixes with dashes", () => {
      const list = ["first", "second", "third"]

      const output = ul(list)

      expect(output).toMatch("- first")
    })
  })

  describe("ol", () => {
    it("prefixes with numbers", () => {
      const list = ["first", "second", "third"]

      const output = ol(list)

      expect(output).toMatch("1. first")
    })

    it("changes number for each line", () => {
      const list = ["first", "second", "third"]

      const output = ol(list)

      expect(output).toMatch("3. third")
    })
  })

  describe("indented", () => {
    it("prefixes first line with a tab", () => {
      const list = ["first", "second", "third"]

      const output = indented(list)

      expect(output).toMatch("\tfirst")
    })

    it("prefixes later lines with tabs", () => {
      const list = ["first", "second", "third"]

      const output = indented(list)

      expect(output).toMatch("\tthird")
    })
  })

  describe("spaced", () => {
    it("joins using spaces", () => {
      const list = ["first", "second", "third"]

      const output = spaced(list)

      expect(output).toEqual("first second third")
    })
  })

  describe("arithmetic", () => {
    it("strips zeroes", () => {
      const list = [1, 2, 0, 4, 5]

      const output = arithmetic(list)

      expect(output).not.toMatch("0")
    })

    describe("first number", () => {
      it("is emitted as-is when positive", () => {
        const list = [1]

        const output = arithmetic(list)

        expect(output).toEqual("1")
      })

      it("is prefixed with sign when negative", () => {
        const list = [-1]

        const output = arithmetic(list)

        expect(output).toEqual("-1")
      })
    })

    describe("remaining numbers", () => {
      it("each is emitted with operator", () => {
        const list = [-1, 3, -2, 6]

        const output = arithmetic(list)

        expect(output).toEqual("-1 + 3 - 2 + 6")
      })
    })
  })

  describe("signed", () => {
    it("shows a plus for positive numbers", () => {
      const result = signed(5)

      expect(result).toEqual("+5")
    })

    it("shows a minus for negative numbers", () => {
      const result = signed(-3)

      expect(result).toEqual("-3")
    })
  })
})
