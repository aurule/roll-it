const coin_command = require("./coin")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("execute", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  it("performs the roll", async () => {
    const result = await coin_command.execute(interaction)

    expect(result.content).toMatch("flipped a coin")
  })

  test_secret_option(coin_command)
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
      call: "1",
    }

    const result = coin_command.perform(options)

    expect(result).toMatch("called *heads*")
  })
})

describe("schema", () => {
  describe("call", () => {
    it("is optional", () => {
      const options = {}
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("call")
    })

    it.each([["1"], ["2"]])("allows %s", (call_value) => {
      const options = {
        call: call_value,
      }
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("call")
    })

    it("disallows other values", () => {
      const options = {
        call: "nopealope",
      }
      const result = coin_command.schema.validate(options, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("must be")
    })
  })
})
