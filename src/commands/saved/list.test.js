vitest.mock("../../util/message-builders")

import { UserSavedRolls } from "../../db/saved_rolls.js"
import { Interaction } from "../../../testing/interaction.js"

import { List } from "./list.js"

describe("/saved list", () => {
  let interaction
  let saved_rolls

  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  describe("perform", () => {
    it("shows all saved rolls for the user and guild", () => {
      saved_rolls.create({
        name: "test1",
        description: "test1",
        command: "d20",
        options: {},
      })
      saved_rolls.create({
        name: "test2",
        description: "test2",
        command: "d20",
        options: {},
      })
      const cmd = new List(interaction)

      const result = cmd.perform()

      expect(result).toMatch("test1")
      expect(result).toMatch("test2")
    })

    it("shows a message when there are no saved rolls", () => {
      const cmd = new List(interaction)

      const result = cmd.perform()

      expect(result).toMatch("no saved rolls")
    })

    it("marks invalid rolls", () => {
      saved_rolls.create({
        name: "test1",
        description: "test1",
        invalid: true,
        command: "d20",
        options: {
          keep: "all the things",
        },
      })
      const cmd = new List(interaction)

      const result = cmd.perform()

      expect(result).toMatch(":x:")
    })
  })
})
