const swn_command = require("./swn")

const { Interaction } = require("../testing/interaction")
const { schemaMessages } = require("../testing/schema-messages")
const { test_secret_option } = require("../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("pool", () => {
    const pool_schema = swn_command.schema.extract("pool")

    it("has a min of 2", () => {
      const result = pool_schema.validate(1)

      expect(result.error).toBeTruthy()
    })
  })
})

describe("perform", () => {
  it("displays the description if present", () => {
    const options = {
      description: "this is a test",
      rolls: 1,
    }

    const result = swn_command.perform(options)

    expect(result).toMatch("this is a test")
  })
})

describe("execute", () => {
  describe("with one roll", () => {
    test_secret_option(swn_command, { rolls: 1 })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      swn_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })
  })
})
