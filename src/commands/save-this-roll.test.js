vitest.mock("../util/message-builders")

import { UserSavedRolls } from "../db/saved_rolls.js"
import { Interaction } from "../../testing/interaction.js"
import interactionCache from "../services/interaction-cache.js"

import { SaveThisRoll } from "./save-this-roll.js"

describe("Save this roll command", () => {
  describe("execute", () => {
    let interaction
    let past_interaction
    beforeEach(() => {
      interaction = new Interaction()
      past_interaction = new Interaction(interaction.guildId)
      interaction.targetMessage = {
        guildId: interaction.guildId,
        interactionMetadata: {
          id: past_interaction.id,
        },
        author: { id: process.env.CLIENT_ID },
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
