const { Interaction } = require("../../../testing/interaction")
const { test_secret_option } = require("../../../testing/shared/execute-secret")

const met_static_command = require("./static")

describe("/met static", () => {
  describe("perform", () => {
    it("rolls a single result", () => {
      const result = met_static_command.perform({})

      expect(result).toMatch("rolled")
    })

    it("rolls multiple results", () => {
      const result = met_static_command.perform({
        rolls: 2,
      })

      expect(result).toMatch("2 times")
    })

    it("shows description if present", () => {
      const result = met_static_command.perform({
        description: "a test",
      })

      expect(result).toMatch("a test")
    })
  })

  describe("execute", () => {
    var interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "static"
    })

    test_secret_option(met_static_command)
  })

  describe("judge", () => {
    it("returns neutral message with no opponent", () => {
      const result = met_static_command.judge([""], "en-US")

      expect(result).toMatch("noted")
    })

    it("returns great message with more than half wins", () => {
      const compared = ["win", "win", "lose"]

      const result = met_static_command.judge(compared, "en-US")

      expect(result).toMatch("pleases")
    })

    it("returns good message with more than half ties", () => {
      const compared = ["tie", "tie", "lose"]

      const result = met_static_command.judge(compared, "en-US")

      expect(result).toMatch("accepted")
    })

    it("returns awful message with more than half loses", () => {
      const compared = ["lose", "lose", "lose"]

      const result = met_static_command.judge(compared, "en-US")

      expect(result).toMatch("angers")
    })

    it("returns neutral message with no dominant result", () => {
      const compared = ["win", "tie", "lose"]

      const result = met_static_command.judge(compared, "en-US")

      expect(result).toMatch("noted")
    })
  })
})
