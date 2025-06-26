const { help_topics } = require("../index")

describe("help topics", () => {
  describe.each(help_topics.map((value, key) => [key, value]))("%s", (name, topic) => {
    it("has a name", () => {
      expect(topic.name).toBeTruthy()
    })

    it("data name matches file name", () => {
      expect(topic.name).toEqual(name)
    })
  })
})
