vitest.mock("../util/message-builders")

import { UserSavedRolls } from "../db/saved_rolls.js"
import { Interaction } from "../../testing/interaction.js"
import interactionCache from "../services/interaction-cache.js"

import "./chop.js"
import "./d20.js"

import { SaveThisRoll } from "./save-this-roll.js"

describe("Save this roll command", () => {
  describe("execute", () => {
    /**
     * @type Interaction
     */
    let interaction

    /**
     * @type Interaction
     */
    let past_interaction

    /**
     * @type UserSavedRolls
     */
    let saved_rolls

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
      const save_roll_command = new SaveThisRoll(interaction)

      await save_roll_command.execute()

      expect(interaction.replyContent).toMatch("not sent by a Roll It command")
    })

    it("warns on cache miss", async () => {
      const save_roll_command = new SaveThisRoll(interaction)

      await save_roll_command.execute()

      expect(interaction.replyContent).toMatch("is not available")
    })

    it("warns on non-savable command", async () => {
      await cacheCommand("chop")
      const save_roll_command = new SaveThisRoll(interaction)

      await save_roll_command.execute()

      expect(interaction.replyContent).toMatch("cannot be saved")
    })

    it("warns on invalid options", async () => {
      await cacheCommand("d20", { keep: "none" })
      const save_roll_command = new SaveThisRoll(interaction)

      await save_roll_command.execute()

      expect(interaction.replyContent).toMatch("options cannot be saved")
    })

    it("shows a modal", async () => {
      await cacheCommand("d20", { keep: "none" })
      const save_roll_command = new SaveThisRoll(interaction)

      const sent = await save_roll_command.execute()

      expect(sent).toBeTruthy()
    })
  })
})
