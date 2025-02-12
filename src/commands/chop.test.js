const chop_command = require("./chop")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("bomb", () => {
    const bomb_schema = chop_command.schema.extract("bomb")

    it("is optional", () => {
      const options = {}

      const result = bomb_schema.validate(undefined)

      expect(result.error).toBeFalsy()
    })

    it("is boolean", () => {
      const options = {
        bomb: "yes",
      }

      const result = bomb_schema.validate("yes")

      expect(result.error).toBeTruthy()
    })
  })

  describe("static_test", () => {
    const static_schema = chop_command.schema.extract("static_test")

    it("is optional", () => {
      const options = {}

      const result = static_schema.validate()

      expect(result.error).toBeFalsy()
    })

    it("is boolean", () => {
      const options = {
        static_test: "yes",
      }

      const result = static_schema.validate("yes")

      expect(result.error).toBeTruthy()
    })
  })
})

describe("perform", () => {
  it("includes the description", () => {
    const options = {
      rolls: 1,
      static_test: false,
      bomb: false,
      description: "test desc",
    }

    const result = chop_command.perform(options)

    expect(result).toMatch("test desc")
  })
})

describe("execute", () => {
  it("performs the roll", () => {
    interaction.command_options.description = "test desc"

    chop_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test desc")
  })

  test_secret_option(chop_command)
})
