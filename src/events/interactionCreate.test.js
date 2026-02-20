vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"

import { handleInteractionCreated, handleCommand, handleAutocomplete, handleModal } from "./interactionCreate.js"
import * as spyable from "./interactionCreate.js"

describe("interactionCreate handler", () => {
  let interaction
  beforeEach(() => {
    interaction = new Interaction()
  })

  describe.skip("handleInteractionCreated", () => {
    let handleSpy

    describe("when in the wrong environment", () => {
      const OLD_ENV = process.env

      beforeEach(() => {
        process.env = { ...OLD_ENV }
        process.env.DEV_GUILDS = `[${interaction.guildId}]`
      })

      afterAll(() => {
        process.env = OLD_ENV
      })

      it("aborts the event", () => {
        return expect(handleInteractionCreated(interaction)).resolves.toMatch(
          "wrong guild for env",
        )
      })
    })

    describe("dispatches commands", () => {
      beforeEach(() => {
        interaction.interactionType = "command"
        handleSpy = vitest.spyOn(spyable, "handleCommand")
      })

      afterEach(() => {
        vitest.clearAllMocks()
      })

      it("executes commands", () => {
        handleSpy.mockResolvedValue("worked")

        return expect(handleInteractionCreated(interaction)).resolves.toMatch("worked")
      })

      it("executes application commands", () => {
        interaction.interactionType = "chatInputCommand"
        handleSpy.mockResolvedValue("worked")

        return expect(handleInteractionCreated(interaction)).resolves.toMatch("worked")
      })

      it("gracefully handles command errors", async () => {
        handleSpy.mockRejectedValue("failed")

        const result = await handleInteractionCreated(interaction)

        expect(result.content).toMatch("There was an error")
      })
    })

    describe("dispatches autocompletes", () => {
      beforeEach(() => {
        interaction.interactionType = "autocomplete"
        handleSpy = vitest.spyOn(spyable, "handleAutocomplete")
      })

      it("executes autocompletes", () => {
        handleSpy.mockResolvedValue("worked")

        return expect(handleInteractionCreated(interaction)).resolves.toMatch("worked")
      })

      it("gracefully handles autocomplete errors", async () => {
        handleSpy.mockRejectedValue("failed")

        const result = await handleInteractionCreated(interaction)

        expect(result).toEqual([])
      })
    })
  })

  describe("handleCommand", () => {
    const testCommand = {
      execute: (_interaction) => "worked",
    }

    beforeEach(() => {
      interaction.client.commands.set("testing", testCommand)
      interaction.commandName = "testing"
    })

    it("rejects on unknown command", async () => {
      interaction.commandName = "nope"

      return expect(await handleCommand(interaction)).rejects.toMatch("no command")
    })

    describe("when command is in a guild", () => {
      // new guild behavior not yet specified
    })

    describe("when command has no policy", () => {
      it("executes the command", () => {
        return expect(handleCommand(interaction)).resolves.toMatch("worked")
      })
    })

    describe("when command has a policy", () => {
      afterEach(() => {
        testCommand.policy = undefined
      })

      it("executes the command when the policy allows", () => {
        testCommand.policy = {
          allow: async (_interaction) => true,
        }

        return expect(handleCommand(interaction)).resolves.toMatch("worked")
      })

      it("replies with the policy error message when the policy disallows", () => {
        testCommand.policy = {
          allow: async (_interaction) => false,
          errorMessage: "not allowed",
        }

        return expect(handleCommand(interaction)).resolves.toMatchObject({
          content: "not allowed",
        })
      })
    })
  })

  describe("handleAutocomplete", () => {
    const testCommand = {
      autocomplete: async (_interaction) => "worked",
    }

    const invalidTestCommand = {
      autocomplete: undefined,
    }

    it("rejects on unknown command", () => {
      interaction.client.commands.set("testing", testCommand)
      interaction.commandName = "nope"

      return expect(handleAutocomplete(interaction)).rejects.toMatch(
        "no command",
      )
    })

    it("rejects if no completer registered for the current option", () => {
      interaction.client.commands.set("testing", invalidTestCommand)
      interaction.commandName = "testing"

      return expect(handleAutocomplete(interaction)).rejects.toMatch(
        "no autocomplete",
      )
    })

    it("executes the completer", () => {
      interaction.client.commands.set("testing", testCommand)
      interaction.commandName = "testing"
      interaction.focused_option = "testOption"

      return expect(handleAutocomplete(interaction)).resolves.toMatch(
        "worked",
      )
    })
  })

  describe("handleModal", () => {
    const testModal = {
      submit: async (_interaction, id) => `worked ${id}`,
    }

    it("rejects on unknown modal", () => {
      interaction.client.modals.set("testing", testModal)
      interaction.customId = "nope"

      return expect(handleModal(interaction)).rejects.toMatch("no modal")
    })

    it("executes the modal submit method", () => {
      interaction.client.modals.set("testing", testModal)
      interaction.customId = "testing"

      return expect(handleModal(interaction)).resolves.toMatch("worked")
    })

    it("sends the extracted id", () => {
      interaction.client.modals.set("testing", testModal)
      interaction.customId = "testing_5"

      return expect(handleModal(interaction)).resolves.toMatch("5")
    })
  })
})
