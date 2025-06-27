const coin_command = require("./coin")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("/coin command", () => {
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

  describe("judge", () => {
    it("returns empty string with no call", () => {
      const result = coin_command.judge([[1]], "", "en-US")

      expect(result).toEqual("")
    })

    it("returns good message when call matches result", () => {
      const result = coin_command.judge([[1]], "1", "en-US")

      expect(result).toMatch("accepted")
    })

    it("returns bad message when call does not match result", () => {
      const result = coin_command.judge([[1]], "2", "en-US")

      expect(result).toMatch("inadequate")
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
        call: "1",
      }

      const result = coin_command.perform(options)

      expect(result).toMatch("called *heads*")
    })

    it("displays sacrifice easter egg", () => {
      const options = {
        description: "sacrificing a chicken",
      }

      const result = coin_command.perform(options)

      expect(result).toMatch("Your sacrifice")
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

      it.concurrent.each([["1"], ["2"]])("allows %s", async (call_value) => {
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
})
