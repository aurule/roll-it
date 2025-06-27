const curv_command = require("./curv")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("/curv command", () => {
  describe("schema", () => {
    describe("keep", () => {
      const keep_schema = curv_command.schema.extract("keep")

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
      const with_schema = curv_command.schema.extract("with")

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

      const result = curv_command.schema.validate(options, { abortEarly: false })

      expect(result.error.message).toMatch("exclusive peers")
    })

    it("allows keep alone", () => {
      const options = {
        keep: "all",
      }

      const result = curv_command.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })

    it("allows with alone", () => {
      const options = {
        with: "advantage",
      }

      const result = curv_command.schema.validate(options, { abortEarly: false })

      expect(result.error).toBeFalsy()
    })
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      const options = {
        description: "this is a test",
        rolls: 1,
      }

      const result = curv_command.perform(options)

      expect(result).toMatch("this is a test")
    })

    it("overrides `keep` using `with`", () => {
      const options = {
        rolls: 1,
        keep: "all",
        with: "advantage",
      }

      const result = curv_command.perform(options)

      expect(result).toMatch("advantage")
    })

    it("allows disadvantage", () => {
      const options = {
        rolls: 1,
        with: "disadvantage",
      }

      const result = curv_command.perform(options)

      expect(result).toMatch("disadvantage")
    })
  })

  describe("execute", () => {
    describe("with one roll", () => {
      test_secret_option(curv_command, { rolls: 1 })
    })

    describe("with multiple rolls", () => {
      beforeEach(() => {
        interaction.command_options.rolls = 2
      })

      it("displays the description if present", () => {
        const description_text = "this is a test"
        interaction.command_options.description = description_text

        curv_command.execute(interaction)

        expect(interaction.replyContent).toMatch(description_text)
      })
    })
  })
})
