import { all } from "./command-completers.js"

describe("command name completers", () => {
  describe("all", () => {
    it("searches command names by lowercase", () => {
      const result = all("WOD")

      expect(result.length).toEqual(1)
    })

    it("sends command name as value", () => {
      const result = all("CHOP")

      expect(result[0].value).toEqual("chop")
    })

    it("sends up to 25 options", () => {
      const result = all("")

      expect(result.length).toEqual(25)
    })
  })
})
