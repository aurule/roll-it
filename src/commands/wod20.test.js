vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"

import { Wod20 } from "./wod20.js"

describe("/wod20 command", () => {
  describe("schema", () => {
    describe("difficulty", () => {
      const difficulty_schema = Wod20.schema.extract("difficulty")

      it("is optional", () => {
        const result = difficulty_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const result = difficulty_schema.validate(5.5)

        expect(result.error).toBeTruthy()
      })

      it("min of 2", () => {
        const result = difficulty_schema.validate(1)

        expect(result.error).toBeTruthy()
      })

      it("max of 10", () => {
        const result = difficulty_schema.validate(11)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = difficulty_schema.validate(9)

        expect(result.error).toBeFalsy()
      })
    })

    describe("specialty", () => {
      const specialty_schema = Wod20.schema.extract("specialty")

      it("is optional", () => {
        const result = specialty_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = specialty_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = specialty_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("judge", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with dominant outcome", () => {
      const parameters = [
        // 3 expected successes
        [6, 6, 6, "pleases"],
        [6, 4, 6, "accepted"],
        [6, 3, 6, "noted"],
        [6, 2, 6, "inadequate"],
        [6, 0, 6, "angers"],
        // 2 expected successes
        [8, 4, 6, "pleases"],
        [8, 3, 6, "accepted"],
        [8, 2, 6, "noted"],
        [8, 1, 6, "inadequate"],
        [8, 0, 6, "angers"],
        // 1 expected success
        [9, 2, 6, "pleases"],
        [9, 1, 6, "noted"],
        [9, 0, 6, "angers"],
      ]
      it.concurrent.each(
        parameters,
      )(`difficulty %i, returns the correct text for %i successes`, async (difficulty, sum, pool, text) => {
        interaction.command_options = {
          pool: pool,
          difficulty: difficulty,
        }
        const wod_command = new Wod20(interaction)
        const results = [[sum]]

        const result = wod_command.judge(results)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        interaction.command_options = {
          pool: 6,
          difficulty: 8,
        }
        const wod_command = new Wod20(interaction)
        const results = [0, 2, 4]

        const result = wod_command.judge(results)

        expect(result).toMatch("noted")
      })
    })
  })

  describe("validate", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with teamwork", () => {
      beforeEach(() => {
        interaction.command_options = {
          teamwork: true,
        }
      })

      it("requires one roll", () => {
        interaction.command_options.rolls = 5
        const cmd = new Wod20(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("disallows until", () => {
        interaction.command_options.until = 5
        const cmd = new Wod20(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("disallows secret", () => {
        interaction.command_options.secret = true
        const cmd = new Wod20(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("shows the sacrifice easter egg if triggered", () => {
      interaction.command_options = {
        description: "sacrificing",
      }
      const cmd = new Wod20(interaction)

      const result = cmd.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })
})
