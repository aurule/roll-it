import { list } from "./topic-name-presenter.js"

describe("help topic name presenter", () => {
  describe("list", () => {
    it("shows the topic names", () => {
      const result = list("en-US")

      const joined = result.join("\n")
      expect(joined).toMatch("About")
    })

    it("shows the topic descriptions", () => {
      const result = list("en-US")

      const joined = result.join("\n")
      expect(joined).toMatch("Author and license")
    })
  })
})
