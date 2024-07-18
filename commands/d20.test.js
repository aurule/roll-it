const d20_command = require("./d20")

const { Interaction } = require("../testing/interaction")
const { schemaMessages } = require("../testing/schema-messages")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("keep", () => {
    it("is optional", () => {
      const options = {}

      const result = d20_command.schema.validate(options)

      expect(schemaMessages(result)).not.toMatch("must be one of")
    })

    it("rejects unknown values", () => {
      const options = {
        keep: "nothing",
      }

      const result = d20_command.schema.validate(options)

      expect(schemaMessages(result)).toMatch("must be one of")
    })

    it.each([
      ["all"],
      ["highest"],
      ["lowest"],
    ])("accepts '%s'", (value) => {
      const options = {
        keep: value
      }

      const result = d20_command.schema.validate(options)

      expect(schemaMessages(result)).not.toMatch("must be one of")
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
})

describe("execute", () => {
  describe("with one roll", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 1
    })

    describe("secret", () => {
      it("when secret is true, reply is ephemeral", () => {
        interaction.command_options.secret = true

        d20_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeTruthy()
      })

      it("when secret is false, reply is not ephemeral", () => {
        interaction.command_options.secret = false

        d20_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })

      it("secret defaults to false", () => {
        d20_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })
    })
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
