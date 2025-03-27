const { UserSavedRolls } = require("../db/saved_rolls")
const { Interaction } = require("../../testing/interaction")
const interactionCache = require("../services/interaction-cache")

const save_roll_command = require("./save-this-roll")

require("dotenv").config()
const botId = process.env.CLIENT_ID

describe("Save this roll", () => {
  describe("execute", () => {
    let interaction
    let past_interaction
    let saved_rolls
    beforeEach(() => {
      interaction = new Interaction()
      past_interaction = new Interaction(interaction.guildId)
      interaction.targetMessage = {
        guildId: interaction.guildId,
        interactionMetadata: {
          id: past_interaction.id,
        },
        author: { id: botId },
      }
      saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    })

    const cacheCommand = async (commandName, commandOptions = {}) => {
      past_interaction.commandName = commandName
      past_interaction.options.data = Object.entries(commandOptions).map(([name, value]) => ({
        name,
        value,
      }))
      return interactionCache.set(past_interaction)
    }

    it("warns on bad author ID", async () => {
      interaction.targetMessage.author.id = "wasnt_me"

      await save_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("not sent by a Roll It command")
    })

    it("warns on cache miss", async () => {
      await save_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("is not available")
    })

    it("warns on non-savable command", async () => {
      await cacheCommand("chop")

      await save_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("cannot be saved")
    })

    it("warns on invalid options", async () => {
      await cacheCommand("d20", { keep: "none" })

      await save_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("options cannot be saved")
    })

    it("shows a modal", async () => {
      await cacheCommand("d20", { keep: "none" })

      const sent = await save_roll_command.execute(interaction)

      expect(sent).toBeTruthy()
    })
  })
})
