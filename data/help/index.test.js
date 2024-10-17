const { help_topics } = require("../index")

describe("help topics", () => {
  describe.each(
    help_topics.map((value, key) => [key, value]))
  ("%s", (name, topic) => {
    it("has a name", () => {
      expect(topic.name).toBeTruthy()
    })

    it("has a title", () => {
      expect(topic.title).toBeTruthy()
    })

    it("has a description", () => {
      expect(topic.description).toBeTruthy()
    })

    it("help method returns a string", () => {
      const result = topic.help()

      expect(result).toBeTruthy()
    })
  })
})
