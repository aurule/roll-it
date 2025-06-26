const commands_topic = require("./commands")

describe("commands help topic", () => {
  describe("help_data", () => {
    it("includes a list of commands", () => {
      const data = commands_topic.help_data("en-US")

      expect(data.commands.some((c) => c.startsWith("`/8ball`"))).toBe(true)
    })
  })
})
