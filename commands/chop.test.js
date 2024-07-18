const chop_command = require("./chop")

const { Interaction } = require("../testing/interaction")
const { schemaMessages } = require("../testing/schema-messages")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("bomb", () => {
    it("is optional", () => {
      const options = {}

      const result = chop_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("bomb")
    })

    it("is boolean", () => {
      const options = {
        bomb: "yes",
      }

      const result = chop_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("bomb")
    })
  })

  describe("static_test", () => {
    it("is optional", () => {
      const options = {}

      const result = chop_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("static")
    })

    it("is boolean", () => {
      const options = {
        static_test: "yes",
      }

      const result = chop_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("static")
    })
  })
})

describe("perform", () => {
  it("includes the description", () => {
    const options = {
      rolls: 1,
      static_test: false,
      bomb: false,
      description: "test desc"
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

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", () => {
      interaction.command_options.secret = true

      chop_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", () => {
      interaction.command_options.secret = false

      chop_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", () => {
      chop_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
