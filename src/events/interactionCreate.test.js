const { Collection } = require("discord.js")
const { logger } = require("../util/logger")
const { Interaction } = require("../../testing/interaction")
const EnvAllowsGuild = require("../util/env-allows-guild")

const InteractionCreateEvent = require("./interactionCreate")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("interactionCreate handler", () => {
  describe("execute", () => {
    var handleSpy

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
        return expect(InteractionCreateEvent.execute(interaction)).resolves.toMatch(
          "wrong guild for env",
        )
      })
    })

    describe("dispatches commands", () => {
      beforeEach(() => {
        interaction.interactionType = "command"
        handleSpy = jest.spyOn(InteractionCreateEvent, "handleCommand")
      })

      it("executes commands", () => {
        handleSpy.mockResolvedValue("worked")

        return expect(InteractionCreateEvent.execute(interaction)).resolves.toMatch("worked")
      })

      it("executes application commands", () => {
        interaction.interactionType = "chatInputCommand"
        handleSpy.mockResolvedValue("worked")

        return expect(InteractionCreateEvent.execute(interaction)).resolves.toMatch("worked")
      })

      it("gracefully handles command errors", async () => {
        handleSpy.mockRejectedValue("failed")

        const result = await InteractionCreateEvent.execute(interaction)

        expect(result.content).toMatch("There was an error")
      })
    })

    describe("dispatches autocompletes", () => {
      beforeEach(() => {
        interaction.interactionType = "autocomplete"
        handleSpy = jest.spyOn(InteractionCreateEvent, "handleAutocomplete")
      })

      it("executes autocompletes", () => {
        handleSpy.mockResolvedValue("worked")

        return expect(InteractionCreateEvent.execute(interaction)).resolves.toMatch("worked")
      })

      it("gracefully handles autocomplete errors", async () => {
        handleSpy.mockRejectedValue("failed")

        const result = await InteractionCreateEvent.execute(interaction)

        expect(result).toEqual([])
      })
    })
  })

  describe("handleCommand", () => {
    const testCommand = {
      execute: (interaction) => "worked",
    }

    beforeEach(() => {
      interaction.client.commands.set("testing", testCommand)
      interaction.commandName = "testing"
    })

    it("rejects on unknown command", () => {
      interaction.commandName = "nope"

      return expect(InteractionCreateEvent.handleCommand(interaction)).rejects.toMatch("no command")
    })

    describe("when command is in a guild", () => {
      // new guild behavior not yet specified
    })

    describe("when command has no policy", () => {
      it("executes the command", () => {
        return expect(InteractionCreateEvent.handleCommand(interaction)).resolves.toMatch("worked")
      })
    })

    describe("when command has a policy", () => {
      afterEach(() => {
        testCommand.policy = undefined
      })

      it("executes the command when the policy allows", () => {
        testCommand.policy = {
          allow: async (interaction) => true,
        }

        return expect(InteractionCreateEvent.handleCommand(interaction)).resolves.toMatch("worked")
      })

      it("replies with the policy error message when the policy disallows", () => {
        testCommand.policy = {
          allow: async (interaction) => false,
          errorMessage: "not allowed",
        }

        return expect(InteractionCreateEvent.handleCommand(interaction)).resolves.toMatchObject({
          content: "not allowed",
        })
      })
    })
  })

  describe("handleAutocomplete", () => {
    const testCommand = {
      autocomplete: async (interaction) => "worked",
    }

    const invalidTestCommand = {
      autocomplete: undefined,
    }

    it("rejects on unknown command", () => {
      interaction.client.commands.set("testing", testCommand)
      interaction.commandName = "nope"

      return expect(InteractionCreateEvent.handleAutocomplete(interaction)).rejects.toMatch(
        "no command",
      )
    })

    it("rejects if no completer registered for the current option", () => {
      interaction.client.commands.set("testing", invalidTestCommand)
      interaction.commandName = "testing"

      return expect(InteractionCreateEvent.handleAutocomplete(interaction)).rejects.toMatch(
        "no autocomplete",
      )
    })

    it("executes the completer", () => {
      interaction.client.commands.set("testing", testCommand)
      interaction.commandName = "testing"
      interaction.focused_option = "testOption"

      return expect(InteractionCreateEvent.handleAutocomplete(interaction)).resolves.toMatch(
        "worked",
      )
    })
  })

  describe("handleModal", () => {
    const testModal = {
      submit: async (interaction, id) => `worked ${id}`,
    }

    it("rejects on unknown modal", () => {
      interaction.client.modals.set("testing", testModal)
      interaction.customId = "nope"

      return expect(InteractionCreateEvent.handleModal(interaction)).rejects.toMatch("no modal")
    })

    it("executes the modal submit method", () => {
      interaction.client.modals.set("testing", testModal)
      interaction.customId = "testing"

      return expect(InteractionCreateEvent.handleModal(interaction)).resolves.toMatch("worked")
    })

    it("sends the extracted id", () => {
      interaction.client.modals.set("testing", testModal)
      interaction.customId = "testing_5"

      return expect(InteractionCreateEvent.handleModal(interaction)).resolves.toMatch("5")
    })
  })
})
