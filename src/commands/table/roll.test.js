vitest.mock("../../util/message-builders")

import { GuildRollables } from "../../db/rollable.js"
import { Interaction } from "../../../testing/interaction.js"

import { Roll } from "./roll.js"

describe("/table roll", () => {
  describe("execute", () => {
    var interaction
    var rollables
    var table_id

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "roll"
      rollables = new GuildRollables(interaction.guildId)
      const insertion = rollables.create("test", "a test", ["first"])
      table_id = insertion.lastInsertRowid
    })

    it("warns on missing table", async () => {
      interaction.command_options.table = 0

      await table_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("does not exist")
    })

    it("rolls a single result", async () => {
      interaction.command_options.table = table_id

      await table_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("first")
    })

    it("rolls multiple results", async () => {
      interaction.command_options.table = table_id
      interaction.command_options.rolls = 2

      await table_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("rolled 2 times")
    })

    it("shows the description, if present", async () => {
      interaction.command_options.table = table_id
      interaction.command_options.description = "roll description"

      await table_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("roll description")
    })
  })
})
