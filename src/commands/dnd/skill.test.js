const { Interaction } = require("../../../testing/interaction")
const { test_secret_option } = require("../../../testing/shared/execute-secret")

const dnd_skill_command = require("./skill")

describe("/dnd skill", () => {
  describe("perform", () => {
    it("rolls a single result", () => {
      const result = dnd_skill_command.perform({})

      expect(result).toMatch("rolled")
    })

    it("rolls multiple results", () => {
      const result = dnd_skill_command.perform({
        rolls: 2,
      })

      expect(result).toMatch("2 times")
    })

    it("shows description if present", () => {
      const result = dnd_skill_command.perform({
        description: "a test",
      })

      expect(result).toMatch("a test")
    })
  })

  describe("execute", () => {
    var interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "skill"
    })

    test_secret_option(dnd_skill_command)
  })
})
