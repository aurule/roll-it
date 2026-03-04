vitest.mock("../../util/message-builders")

import "../../commands/8ball.js"
import { Interaction } from "../../../testing/interaction.js"

import { CommandHelp } from "./command.js"

describe("/help command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("perform", () => {
    it("with a real command, it returns the help text", () => {
      interaction.command_options = {
        command: "8ball",
      }
      const cmd = new CommandHelp(interaction)

      const result = cmd.perform()

      expect(result).toMatch("Magic 8 Ball")
    })
  })

  describe("validation", () => {
    it("with a fake command, it returns no help available message", () => {
      interaction.command_options = {
        command: "lollery",
      }
      const cmd = new CommandHelp(interaction)

      const result = cmd.validate()

      expect(result).toMatch("No help is available")
    })

    it("with no command, it returns no help available message", () => {
      interaction.command_options = {
        command: "",
      }
      const cmd = new CommandHelp(interaction)

      const result = cmd.validate()

      expect(result).toMatch("No help is available")
    })
  })

  describe("help_data", () => {
    it("gets command names", () => {
      const result = CommandHelp.help_data({ locale: "en-US" })

      expect(result.commands.some((c) => c.includes("8ball"))).toBeTruthy()
    })
  })
})
