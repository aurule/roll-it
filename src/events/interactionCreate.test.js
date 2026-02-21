vitest.mock("../util/message-builders")

import { Collection } from "discord.js"
import { Interaction } from "../../testing/interaction.js"
import { Command } from "../commands/abstract/command.js"
import interactionCache from "../services/interaction-cache.js"

import { handleInteractionCreated, handleCommand, handleAutocomplete, handleModal } from "./interactionCreate.js"
import { Modal } from "../modals/modal.js"

/**
 * Mock command object to make testing easier
 *
 * Always replies with "whee" when invoked and returns a single value "zip" for
 * its autocomplete.
 */
class TestCommand extends Command {
  static name = "test"
  static data() {
    return this.builder
  }
  perform() {
    return "whee"
  }
  async autocomplete() {
    return ["zip"]
  }
}

/**
 * Mock modal object to make testing easier
 *
 * Submit always returns the string "yass"
 */
class TestModal extends Modal {
  static name = "test"
  static data() {
    return {}
  }
  async submit() {
    return "yass"
  }
}

describe("interactionCreate handler", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("handleCommand", () => {
    const testCommands = new Collection([
      ["test", TestCommand ],
      ["test fine", TestCommand ],
    ])

    it("with normal command, uses 'command' key", async () => {
      interaction.commandName = "test"

      await handleCommand(interaction, testCommands)

      expect(interaction.replyContent).toMatch("whee")
    })

    it("with subcommand, uses 'parent child' key", async () => {
      interaction.commandName = "test"
      interaction.command_options.subcommand_name = "fine"

      await handleCommand(interaction, testCommands)

      expect(interaction.replyContent).toMatch("whee")
    })

    it("when command does not exist, rejects with error", async () => {
      interaction.commandName = "nope"

      await expect(handleCommand(interaction, testCommands)).rejects.toThrow("no command")
    })

    it("saves to the interaction cache", async () => {
      interaction.commandName = "test"

      await handleCommand(interaction, testCommands)

      const details = interactionCache.getInteraction(interaction)
      expect(details).toBeTruthy()
    })
  })

  describe("handleAutocomplete", () => {
    const testCommands = new Collection([
      ["test", TestCommand ],
      ["test fine", TestCommand ],
    ])

    it("with normal command, uses 'command' key", async () => {
      interaction.commandName = "test"

      const result = await handleAutocomplete(interaction, testCommands)

      expect(result).toContain("zip")
    })

    it("with subcommand, uses 'parent child' key", async () => {
      interaction.commandName = "test"
      interaction.command_options.subcommand_name = "fine"

      const result = await handleAutocomplete(interaction, testCommands)

      expect(result).toContain("zip")
    })

    it("when command does not exist, rejects with error", async () => {
      interaction.commandName = "nope"

      await expect(handleAutocomplete(interaction, testCommands)).rejects.toThrow("no command")
    })
  })

  describe("handleModal", () => {
    const testModals = new Collection([
      ["test", TestModal ],
    ])

    it("looks up by name without id", async () => {
      interaction.customId = "test_5"

      const result = await handleModal(interaction, testModals)

      expect(result).toMatch("yass")
    })

    it("when modal does not exist, rejects with error", async () => {
      interaction.customId = "nope_5"

      await expect(handleModal(interaction, testModals)).rejects.toThrow("no modal")
    })
  })

  describe.skip("handleInteractionCreated", () => {
    it.todo("with command error, replies with error text")

    it.todo("with autocomplete error, replies with empty suggestions")
  })
})
