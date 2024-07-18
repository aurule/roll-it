const coin_command = require("./coin")

const { Interaction } = require("../testing/interaction")
const { schemaMessages } = require("../testing/schema-messages")

describe("execute", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  it("performs the roll", async () => {
    const result = await coin_command.execute(interaction)

    expect(result.content).toMatch("flipped a coin")
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      const result = await coin_command.execute(interaction)

      expect(result.ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      const result = await coin_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      const result = await coin_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })
  })
})

describe("perform", () => {
  it("displays the description if present", () => {
    const options = {
      description: "this is a test",
    }

    const result = coin_command.perform(options)

    expect(result).toMatch(options.description)
  })

  it("displays the call if present", () => {
    const options = {
      call: "heads",
    }

    const result = coin_command.perform(options)

    expect(result).toMatch("called heads")
  })
})

describe("schema", () => {
  describe("description", () => {
    it("is optional", () => {
      const options = {}
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("description")
    })

    it("allows at most 1500 characters", () => {
      const options = {
        description: "x".repeat(2000),
      }
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("too long")
    })
  })

  describe("call", () => {
    it("is optional", () => {
      const options = {}
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("call")
    })

    it.each([
      ["heads"],
      ["tails"],
    ])("allows %s", (call_value) => {
      const options = {
        call: call_value
      }
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("call")
    })

    it("disallows other values", () => {
      const options = {
        call: "nopealope"
      }
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("must be")
    })
  })
})
