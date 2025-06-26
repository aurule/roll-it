const teamwork_topic = require("./teamwork")

describe("teamwork help topic", () => {
  describe("help_data", () => {
    it("includes a list of teamwork-compatible commands", () => {
      const data = teamwork_topic.help_data("en-US")

      expect(data.teamworkable.some((c) => c.startsWith("`/nwod`"))).toBe(true)
    })
  })
})
