const Presenter = require("./topic-name-presenter")

describe("help topic name presenter", () => {
  describe("list", () => {
    it("shows the topic names", () => {
      const result = Presenter.list("en-US")

      const joined = result.join("\n")
      expect(joined).toMatch("About")
    })

    it("shows the topic descriptions", () => {
      const result = Presenter.list("en-US")

      const joined = result.join("\n")
      expect(joined).toMatch("Author and license")
    })
  })
})
