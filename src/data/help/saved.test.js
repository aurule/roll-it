const saved_topic = require("./saved")

describe("saved help topic", () => {
  describe("help_data", () => {
    it("includes a list of savable commands", () => {
      const data = saved_topic.help_data("en-US")

      expect(data.savable.some((c) => c.startsWith("`/nwod`"))).toBe(true)
    })
  })
})
