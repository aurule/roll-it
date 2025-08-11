const { siteLink, rootLink, ROOT_URL } = require("./site-link")

describe("website link helpers", () => {
  describe("siteLink", () => {
    it("includes the text", () => {
      const result = siteLink("test", "/something")

      expect(result).toMatch("test")
    })

    it("when partial starts with a slash, creates a valid url", () => {
      const result = siteLink("test", "/something")

      expect(result).toMatch("/roll-it/#/something")
    })

    it("when partial does not start with a slash, creates a valid url", () => {
      const result = siteLink("test", "something")

      expect(result).toMatch("/roll-it/#/something")
    })
  })

  describe("rootLink", () => {
    it("includes the text", () => {
      const result = rootLink("test")

      expect(result).toMatch("test")
    })

    it("uses the root url", () => {
      const result = rootLink("test")

      expect(result).toMatch(ROOT_URL)
    })
  })
})
