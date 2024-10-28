const { inline } = require("./inline-list")

describe("inline", () => {
  describe("with zero items", () => {
    const test_array = []

    it("returns an empty string", () => {
      const result = inline(test_array)

      expect(result).toEqual("")
    })
  })

  describe("with one item", () => {
    const test_array = ["single"]

    it("returns the item", () => {
      const result = inline(test_array)

      expect(result).toEqual("single")
    })
  })

  describe("with two items", () => {
    const test_array = ["first", "second"]

    it("returns both items separated by 'and'", () => {
      const result = inline(test_array)

      expect(result).toEqual("first and second")
    })
  })

  describe("three or more items", () => {
    const test_array = ["first", "second", "third"]

    it("separates first few with a comma", () => {
      const result = inline(test_array)

      expect(result).toMatch("first, second")
    })

    it("uses 'and' to attach final entry", () => {
      const result = inline(test_array)

      expect(result).toMatch("and third")
    })

    it("adds an oxford comma", () => {
      const result = inline(test_array)

      expect(result).toMatch(", and")
    })
  })
})
