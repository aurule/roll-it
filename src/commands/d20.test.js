const d20_command = require("./d20")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("d20 command", () => {
  describe("schema", () => {
    describe("keep", () => {
      const keep_schema = d20_command.schema.extract("keep")

      it("is optional", () => {
        const result = keep_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("rejects unknown values", () => {
        const result = keep_schema.validate("nothing")

        expect(result.error).toBeTruthy()
      })

      it.each([["all"], ["highest"], ["lowest"]])("accepts '%s'", (value) => {
        const result = keep_schema.validate(value)

        expect(result.error).toBeFalsy()
      })
    })

    describe("with", () => {
      const with_schema = d20_command.schema.extract("with")

      it("is optional", () => {
        const result = with_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("rejects unknown values", () => {
        const result = with_schema.validate("nothing")

        expect(result.error).toBeTruthy()
      })

      it.each([["advantage"], ["disadvantage"]])("accepts '%s'", (value) => {
        const result = with_schema.validate(value)

        expect(result.error).toBeFalsy()
      })
    })

    it("does not allow 'keep' and 'with'", () => {
      const options = {
        keep: "all",
        with: "advantage",
      }

      const result = d20_command.schema.validate(options, { abortEarly: false })

      expect(result.error.message).toMatch("exclusive peers")
    })

    it("allows keep alone", () => {
      const options = {
        keep: "all",
      }

      const result = d20_command.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })

    it("allows with alone", () => {
      const options = {
        with: "advantage",
      }

      const result = d20_command.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })
  })

  describe("judge", () => {
    describe("with a dominant outcome", () => {
      it.each([
        [20, "pleases"],
        [15, "accepted"],
        [10, "noted"],
        [5, "inadequate"],
        [1, "angers"],
      ])("returns correct text for %i", (die, text) => {
        const picked = [
          {
            results: [die],
          },
        ]

        const result = d20_command.judge(picked, "en-US")

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
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

        const result = d20_command.judge(picked, "en-US")

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      const options = {
        description: "this is a test",
        rolls: 1,
      }

      const result = d20_command.perform(options)

      expect(result).toMatch("this is a test")
    })

    it("overrides `keep` using `with`", () => {
      const options = {
        rolls: 1,
        with: "advantage",
      }

      const result = d20_command.perform(options)

      expect(result).toMatch("advantage")
    })

    it("displays the sacrifice easter egg if present", () => {
      const options = {
        description: "sacrificing a chicken",
        rolls: 1,
      }

      const result = d20_command.perform(options)

      expect(result).toMatch("Your sacrifice")
    })
  })

  describe("execute", () => {
    describe("with one roll", () => {
      test_secret_option(d20_command, { rolls: 1 })
    })

    describe("with multiple rolls", () => {
      beforeEach(() => {
        interaction.command_options.rolls = 2
      })

      it("displays the description if present", () => {
        const description_text = "this is a test"
        interaction.command_options.description = description_text

        d20_command.execute(interaction)

        expect(interaction.replyContent).toMatch(description_text)
      })
    })
  })
})
