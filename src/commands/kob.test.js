const kob_command = require("./kob")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("sides", () => {
    const sides_schema = kob_command.schema.extract("sides")

    it("is required", () => {
      const result = sides_schema.validate()

      expect(result.error).toBeTruthy()
    })

    it("is an integer", () => {
      const result = sides_schema.validate(1.5)

      expect(result.error).toBeTruthy()
    })

    it.each([[4], [6], [8], [10], [12], [20], [100]])("allows %i", (die) => {
      const result = sides_schema.validate(die)

      expect(result.error).toBeFalsy()
    })

    it("disallows other values", () => {
      const result = sides_schema.validate(15)

      expect(result.error).toBeTruthy()
    })
  })
})

describe("perform", () => {
  it("displays the description if present", () => {
    const options = {
      description: "this is a test",
      rolls: 1,
      sides: 6,
    }

    const result = kob_command.perform(options)

    expect(result).toMatch("this is a test")
  })
})

describe("execute", () => {
  describe("with one roll", () => {
    test_secret_option(kob_command, { rolls: 1, sides: 6 })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
      interaction.command_options.sides = 6
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      kob_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })
  })
})
