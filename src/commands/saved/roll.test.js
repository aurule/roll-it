vitest.mock("../../util/message-builders")

import { UserSavedRolls } from "../../db/saved_rolls.js"
import { Interaction } from "../../../testing/interaction.js"
import "../roll.js"

import { Roll } from "./roll.js"

describe("/saved roll", () => {
  let interaction
  let saved_rolls

  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  describe("validate", () => {
    it("requires roll to exist", () => {
      interaction.command_options = {
        name: "nope"
      }
      const cmd = new Roll(interaction)

      const result = cmd.validate()

      expect(result).toMatch("roll does not exist")
    })

    it("requires valid roll", () => {
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
        name: "test"
      }
      const cmd = new Roll(interaction)

      const result = cmd.validate()

      expect(result).toMatch("are not valid")
    })

    describe("with a change target", () => {
      it("requires change target to be allowed by command", () => {
        saved_rolls.create({
          name: "test",
          description: "test",
          command: "roll",
          options: {
            pool: 0,
            sides: 6,
          },
          invalid: false,
        })
        interaction.command_options = {
          name: "test",
          change: "sides",
          bonus: 2,
        }
        const cmd = new Roll(interaction)

        const result = cmd.validate()

        expect(result).toMatch("Cannot change option")
      })
    })
  })

  describe("perform", () => {
    beforeEach(() => {
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
      }
    })
    it("does the roll", async () => {
      const cmd = new Roll(interaction)

      const result = await cmd.perform()

      expect(result).toMatch("rolled")
    })

    it("prioritizes new rolls number", async () => {
      interaction.command_options.rolls = 2
      const cmd = new Roll(interaction)

      const result = await cmd.perform()

      expect(result).toMatch("2 times")
    })

    it("warns and marks the saved roll invalid if saved options are bad", async () => {
      saved_rolls.create({
        name: "test2",
        description: "test",
        command: "roll",
        options: {
          pool: 0,
          sides: 6,
        },
      })
      interaction.command_options.name = "test2"
      const cmd = new Roll(interaction)

      const result = await cmd.perform()

      expect(result).toMatch("no longer valid")
      const detail = saved_rolls.detail(undefined, "test2")
      expect(detail.invalid).toBeTruthy()
    })

    describe("with a bonus", () => {
      beforeEach(() => {
        interaction.command_options.bonus = 3
      })

      it("defaults to first change target", async () => {
        const cmd = new Roll(interaction)

        const result = await cmd.perform()

        expect(result).toMatch("+ 4")
      })

      it("shows bonus", async () => {
        const cmd = new Roll(interaction)

        const result = await cmd.perform()

        expect(result).toMatch("+ 3")
      })

      it("validates against modified option", async () => {
        interaction.command_options.bonus = -1
        interaction.command_options.change = "pool"
        const cmd = new Roll(interaction)

        const result = await cmd.perform()

        expect(result).toMatch("can no longer")
      })

      it("adds to the named option if given", async () => {
        interaction.command_options.change = "pool"
        const cmd = new Roll(interaction)

        const result = await cmd.perform()

        expect(result).toMatch("4d6")
      })
    })
  })
})
