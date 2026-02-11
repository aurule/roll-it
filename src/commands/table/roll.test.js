vitest.mock("../../util/message-builders")

import { GuildRollables } from "../../db/rollable.js"
import { Interaction } from "../../../testing/interaction.js"

import { Roll } from "./roll.js"

describe("/table roll", () => {
  let interaction
  let rollables
  let table_id

  beforeEach(() => {
    interaction = new Interaction()
    rollables = new GuildRollables(interaction.guildId)
    table_id = rollables.create("test", "a test", ["first"]).lastInsertRowid
  })

  describe("validate", () => {
    it("warns on missing table", () => {
      interaction.command_options = {
        table: "nope"
      }
      const cmd = new Roll(interaction)

      const result = cmd.validate()

      expect(result).toMatch("does not exist")
    })
  })

  describe("perform", () => {
    it("rolls single result", () => {
      interaction.command_options = {
        table: "test",
        rolls: 1,
      }
      const cmd = new Roll(interaction)

      const result = cmd.perform()

      expect(result).toMatch("first")
    })

    it("rolls multiple results", () => {
      interaction.command_options = {
        table: "test",
        rolls: 2,
      }
      const cmd = new Roll(interaction)

      const result = cmd.perform()

      expect(result).toMatch("rolled 2 times")
    })
  })
})
