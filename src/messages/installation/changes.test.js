import { differ } from "./changes.js"

describe("pending changes message", () => {
  describe("differ", () => {
    it("with empty everything, returns empty array", () => {
      const olds = []
      const news = []

      const result = differ(olds, news)

      expect(result).toEqual([])
    })

    it("with item in old and new, item is unchanged", () => {
      const olds = ["a"]
      const news = ["a"]

      const result = differ(olds, news)

      expect(result).toEqual(["a"])
    })

    it("with removed item (in old and not in new), item is struck", () => {
      const olds = ["a"]
      const news = []

      const result = differ(olds, news)

      expect(result).toEqual(["~~a~~"])
    })

    it("with new item (in new and not in old), item is underlined", () => {
      const olds = []
      const news = ["a"]

      const result = differ(olds, news)

      expect(result).toEqual(["__a__"])
    })

    it("applies a custom formatter", () => {
      const olds = []
      const news = ["a"]

      const result = differ(olds, news, (f) => `<${f}>`)

      expect(result).toEqual(["__<a>__"])
    })
  })
})
