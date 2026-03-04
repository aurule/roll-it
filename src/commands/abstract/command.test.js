vitest.mock("../util/message-builders")

import { MessageFlags } from "discord.js"
import { Interaction } from "../../../testing/interaction.js"
import { LocalizedSlashCommandBuilder } from "../../util/localized-command.js"

import { Command } from "./command.js"

class TestCommand extends Command {
  static name = "roll"
  validation = undefined

  perform() {
    return "test"
  }

  validate() {
    return this.validation
  }
}

describe("Command base class", () => {
  describe("defaults", () => {
    it("type is slash", () => {
      expect(TestCommand.type).toEqual("slash")
    })

    it("savable is false", () => {
      expect(TestCommand.savable).toBe(false)
    })

    it("teamworkable is false", () => {
      expect(TestCommand.teamworkable).toBe(false)
    })
  })

  describe("builder", () => {
    it("is a localized slash command builder", () => {
      expect(TestCommand.builder).toBeInstanceOf(LocalizedSlashCommandBuilder)
    })
  })

  describe("options", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("secret", () => {
      it("defaults to false", () => {
        const cmd = new TestCommand(interaction)

        expect(cmd.secret).toBe(false)
      })

      it("accepts true", () => {
        interaction.command_options = {
          secret: true,
        }

        const cmd = new TestCommand(interaction)

        expect(cmd.secret).toBe(true)
      })

      it("false makes response non-ephemeral", async () => {
        interaction.command_options = {
          secret: false,
        }
        const cmd = new TestCommand(interaction)

        const result = await cmd.execute()

        expect(result.message.flags).not.toHaveFlag(MessageFlags.Ephemeral)
      })

      it("true makes response ephemeral", async () => {
        interaction.command_options = {
          secret: true,
        }
        const cmd = new TestCommand(interaction)

        const result = await cmd.execute()

        expect(result.message.flags).toHaveFlag(MessageFlags.Ephemeral)
      })
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with validation error", () => {
      it("responds with the validation message", async () => {
        const cmd = new TestCommand(interaction)
        cmd.validation = "nope"

        const result = await cmd.execute()

        expect(result.components[0].data.content).toMatch("nope")
      })
    })
  })
})
