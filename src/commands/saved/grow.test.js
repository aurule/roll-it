vitest.mock("../../util/message-builders")

import "../roll.js"
import { UserSavedRolls } from "../../db/saved_rolls.js"
import { Interaction } from "../../../testing/interaction.js"

import { Grow } from "./grow.js"

describe("/saved grow", () => {
  let interaction

  /**
   * @type UserSavedRolls
   */
  let saved_rolls

  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  describe("validate", () => {
    it("errors on bad saved roll name", () => {
      interaction.command_options = {
        name: "nope",
      }
      const cmd = new Grow(interaction)

      const result = cmd.validate()

      expect(result).toMatch("roll does not exist")
    })

    it("errors when saved roll has invalid flag", () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 0,
          sides: 6,
        },
        invalid: true,
      })
      interaction.command_options = {
        name: "test",
      }
      const cmd = new Grow(interaction)

      const result = cmd.validate()

      expect(result).toMatch("are not valid")
    })

    it("requires adjustment != 0", () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
        },
      })
      interaction.command_options = {
        name: "test",
        adjustment: 0,
      }
      const cmd = new Grow(interaction)

      const result = cmd.validate()

      expect(result).toMatch("zero won't change the roll")
    })

    it("requires change target to be valid for command", () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
        },
      })
      interaction.command_options = {
        name: "test",
        adjustment: 2,
        change: "re-roll",
      }
      const cmd = new Grow(interaction)

      const result = cmd.validate()

      expect(result).toMatch("it does not exist for")
    })
  })

  describe("perform", () => {
    it("updates the roll", () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
          modifier: 1,
        },
      })
      interaction.command_options = {
        name: "test",
        adjustment: 2,
        change: "modifier",
      }
      const cmd = new Grow(interaction)

      cmd.perform()

      const details = saved_rolls.detail(undefined, "test")
      expect(details.options.modifier).toEqual(3)
    })

    it("checks new options against the command schema", () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
        },
      })
      interaction.command_options = {
        name: "test",
        adjustment: -2,
        change: "pool",
      }
      const cmd = new Grow(interaction)

      const result = cmd.perform()

      expect(result).toMatch("would be invalid")
    })
  })
})
