vitest.mock("../../util/message-builders")

import { GuildRollables } from "../../db/rollable.js"
import { Interaction } from "../../../testing/interaction.js"
import { List } from "./list.js"

describe("/table list", () => {
  let interaction
  let rollables

  beforeEach(() => {
    interaction = new Interaction()
    rollables = new GuildRollables(interaction.guildId)

    const contents = ["first"]
    rollables.create("test1", "test desc 1", contents)
    rollables.create("test2", "test desc 2", contents)
  })

  describe("perform", () => {
    it("shows table names", () => {
      const cmd = new List(interaction)

      const result = cmd.perform()

      expect(result).toMatch("test1")
      expect(result).toMatch("test2")
    })

    it("shows table descriptions", () => {
      const cmd = new List(interaction)

      const result = cmd.perform()

      expect(result).toMatch("desc 1")
      expect(result).toMatch("desc 2")
    })
  })
})
