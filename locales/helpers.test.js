const { available_locales } = require("./index")
const { canonical, mapped } = require("./helpers")

describe("canonical", () => {
  describe("for a command", () => {
    it("gets the description", () => {
      const result = canonical("description", "8ball")

      expect(result).toMatch("Magic 8 Ball")
    })
  })

  describe("for an option", () => {
    it("gets the description", () => {
      const result = canonical("description", "8ball", "question")

      expect(result).toMatch("The question")
    })
  })
})

describe("mapped", () => {
  describe("for a command", () => {
    it("builds a name map", () => {
      const result = mapped("name", "8ball")

      expect(result["en-US"]).toMatch("8ball")
    })

    it("builds a description map", () => {
      const result = mapped("description", "8ball")

      expect(result["en-US"]).toMatch("Magic 8 Ball")
    })
  })

  describe("for an option", () => {
    it("builds a name map", () => {
      const result = mapped("name", "8ball", "question")

      expect(result["en-US"]).toMatch("question")
    })

    it("builds a description map", () => {
      const result = mapped("description", "8ball", "question")

      expect(result["en-US"]).toMatch("The question")
    })
  })

  it("has one entry per locale", () => {
    const result = mapped("name", "8ball")

    expect(Object.keys(result).length).toEqual(available_locales.length)
  })
})
