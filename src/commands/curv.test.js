vitest.mock("../util/message-builders")

import { Curv } from "./curv.js"

import { Interaction } from "../../testing/interaction.js"

describe("/curv command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("schema", () => {
    describe("keep", () => {
      const keep_schema = Curv.schema.extract("keep")

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
      const with_schema = Curv.schema.extract("with")

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

      const result = Curv.schema.validate(options, { abortEarly: false })

      expect(result.error.message).toMatch("exclusive peers")
    })

    it("allows keep alone", () => {
      const options = {
        keep: "all",
      }

      const result = Curv.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })

    it("allows with alone", () => {
      const options = {
        with: "advantage",
      }

      const result = Curv.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })
  })

  describe("judge", () => {
    describe("with a dominant outcome", () => {
      it.concurrent.each([
        [18, "pleases"],
        [15, "accepted"],
        [10, "noted"],
        [5, "inadequate"],
        [3, "angers"],
      ])("returns correct text for %i", async (die, text) => {
        const curv_command = new Curv(interaction)
        const picked = [
          {
            results: [die],
          },
        ]

        const result = curv_command.judge(picked)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const curv_command = new Curv(interaction)
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

        const result = curv_command.judge(picked)

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
      const curv_command = new Curv(interaction)

      const result = curv_command.perform()

      expect(result).toMatch("this is a test")
    })

    it("overrides `keep` using `with`", () => {
      interaction.command_options = {
        rolls: 1,
        keep: "all",
        with: "advantage",
      }
      const curv_command = new Curv(interaction)

      const result = curv_command.perform()

      expect(result).toMatch("advantage")
    })

    it("displays the sacrifice easter egg if present", () => {
      interaction.command_options = {
        description: "sacrificing a chicken",
        rolls: 1,
      }
      const curv_command = new Curv(interaction)

      const result = curv_command.perform()

      expect(result).toMatch("Your sacrifice")
    })

    it("allows disadvantage", () => {
      interaction.command_options = {
        rolls: 1,
        with: "disadvantage",
      }
      const curv_command = new Curv(interaction)

      const result = curv_command.perform()

      expect(result).toMatch("disadvantage")
    })

    describe("with multiple rolls", () => {
      beforeEach(() => {
        interaction.command_options.rolls = 2
      })

      it("displays the description if present", async () => {
        const description_text = "this is a test"
        interaction.command_options.description = description_text
        const curv_command = new Curv(interaction)

        await curv_command.execute()

        expect(interaction.replyContent).toMatch(description_text)
      })
    })
  })
})
