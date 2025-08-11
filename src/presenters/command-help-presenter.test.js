const eightball_command = require("../commands/8ball")
const saved_command = require("../commands/saved")
const setup_command = require("../commands/setup-roll-it")
const save_this_roll_command = require("../commands/save-this-roll")

const { present } = require("./command-help-presenter")

describe("command help presenter", () => {
  describe("present", () => {
    it("names the command", () => {
      const result = present(eightball_command, "en-US")

      expect(result).toMatch("`/8ball`")
    })

    it("gets translated help text", () => {
      const result = present(eightball_command, "en-US")

      expect(result).toMatch("asks a question")
    })

    describe("with options", () => {
      it("names the options", () => {
        const result = present(eightball_command, "en-US")

        expect(result).toMatch("`question`")
      })

      it("describes the options", () => {
        const result = present(eightball_command, "en-US")

        expect(result).toMatch("The question")
      })

      it("marks required options", () => {
        const result = present(eightball_command, "en-US")

        expect(result).toMatch("`question` (required)")
      })
    })

    describe("with subcommands", () => {
      it("uses correct label", () => {
        const result = present(saved_command, "en-US")

        expect(result).toMatch("Subcommands:")
      })

      it("shows the subcommands", () => {
        const result = present(saved_command, "en-US")

        expect(result).toMatch("grow")
        expect(result).toMatch("list")
      })
    })

    describe("with no options or subcommands", () => {
      it("has no args section", () => {
        const result = present(setup_command, "en-US")

        expect(result).not.toMatch("Args:")
      })

      it("has no subcommands section", () => {
        const result = present(setup_command, "en-US")

        expect(result).not.toMatch("Subcommands:")
      })
    })

    describe("with a context command", () => {
      it("has no args section", () => {
        const result = present(save_this_roll_command, "en-US")

        expect(result).not.toMatch("Args:")
      })
    })
  })
})
