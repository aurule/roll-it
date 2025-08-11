const Completers = require("./command-completers")

describe("command name completers", () => {
  describe("all", () => {
    it("searches command names by lowercase", () => {
      const result = Completers.all("WOD")

      expect(result.length).toEqual(1)
    })

    it("sends command name as value", () => {
      const result = Completers.all("CHOP")

      expect(result[0].value).toEqual("chop")
    })

    it("sends up to 25 options", () => {
      const result = Completers.all("")

      expect(result.length).toEqual(25)
    })
  })
})
