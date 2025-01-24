const { help_topics } = require("../index")

describe("help topics", () => {
  describe.each(help_topics.map((value, key) => [key, value]))("%s", (name, topic) => {
    it("has a name", () => {
      expect(topic.name).toBeTruthy()
    })
  })
})
