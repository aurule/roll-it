vitest.mock("../util/message-builders")

import { D20 } from "./d20.js"

import { Interaction } from "../../testing/interaction.js"

describe("/d20 command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("schema", () => {
    describe("keep", () => {
      const keep_schema = D20.schema.extract("keep")

      it("is optional", () => {
        const result = keep_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("rejects unknown values", () => {
        const result = keep_schema.validate("nothing")

        expect(result.error).toBeTruthy()
      })

      it.concurrent.each([["all"], ["highest"], ["lowest"]])("accepts '%s'", async (value) => {
        const result = keep_schema.validate(value)

        expect(result.error).toBeFalsy()
      })
    })

    describe("with", () => {
      const with_schema = D20.schema.extract("with")

      it("is optional", () => {
        const result = with_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("rejects unknown values", () => {
        const result = with_schema.validate("nothing")

        expect(result.error).toBeTruthy()
      })

      it.concurrent.each([["advantage"], ["disadvantage"]])("accepts '%s'", async (value) => {
        const result = with_schema.validate(value)

        expect(result.error).toBeFalsy()
      })
    })

    it("does not allow 'keep' and 'with'", () => {
      const options = {
        keep: "all",
        with: "advantage",
      }

      const result = D20.schema.validate(options, { abortEarly: false })

      expect(result.error.message).toMatch("exclusive peers")
    })

    it("allows keep alone", () => {
      const options = {
        keep: "all",
      }

      const result = D20.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })

    it("allows with alone", () => {
      const options = {
        with: "advantage",
      }

      const result = D20.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })
  })

  describe("judge", () => {
    describe("with a dominant outcome", () => {
      it.concurrent.each([
        [20, "pleases"],
        [15, "accepted"],
        [10, "noted"],
        [5, "inadequate"],
        [1, "angers"],
      ])("returns correct text for %i", async (die, text) => {
        const d20_command = new D20(interaction)
        const picked = [
          {
            results: [die],
          },
        ]

        const result = d20_command.judge(picked)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const d20_command = new D20(interaction)
        const picked = [
          {
            results: [20],
          },
          {
            results: [10],
          },
          {
            results: [1],
          },
        ]

        const result = d20_command.judge(picked)

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      interaction.command_options = {
        description: "this is a test",
        rolls: 1,
      }
      const d20_command = new D20(interaction)

      const result = d20_command.perform()

      expect(result).toMatch("this is a test")
    })

    it("overrides `keep` using `with`", () => {
      interaction.command_options = {
        rolls: 1,
        with: "advantage",
      }
      const d20_command = new D20(interaction)

      const result = d20_command.perform()

      expect(result).toMatch("advantage")
    })

    it("displays the sacrifice easter egg if present", () => {
      interaction.command_options = {
        description: "sacrificing a chicken",
        rolls: 1,
      }
      const d20_command = new D20(interaction)

      const result = d20_command.perform()

      expect(result).toMatch("Your sacrifice")
    })

    describe("with multiple rolls", () => {
      beforeEach(() => {
        interaction.command_options.rolls = 2
      })

      it("displays the description if present", () => {
        const description_text = "this is a test"
        interaction.command_options.description = description_text
        const d20_command = new D20(interaction)

        const result = d20_command.perform()

        expect(result).toMatch(description_text)
      })
    })
  })
})
