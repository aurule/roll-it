const systems_topic = require("./systems")

describe("systems help topic", () => {
  describe("help_data", () => {
    it("includes a list of game systems", () => {
      const data = systems_topic.help_data("en-US")

      expect(data.systems.some((c) => c.startsWith("**Kids"))).toBe(true)
    })
  })
})
