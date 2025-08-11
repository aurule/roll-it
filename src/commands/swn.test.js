jest.mock("../util/message-builders")

const swn_command = require("./swn")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("/swn command", () => {
  let interaction

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

  describe("judge", () => {
    describe("with dominant outcome", () => {
      it.concurrent.each([
        [11, "pleases"],
        [9, "accepted"],
        [6, "noted"],
        [4, "inadequate"],
        [2, "angers"],
      ])("returns correct text for %i", async (die, text) => {
        const results = [die]

        const result = swn_command.judge(results, "en-US")

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const results = [2, 7, 12]

        const result = swn_command.judge(results, "en-US")

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

      const result = swn_command.perform(options)

      expect(result).toMatch("this is a test")
    })

    it("displays the sacrifice easter egg if present", () => {
      const options = {
        description: "sacrificing",
        rolls: 1,
      }

      const result = swn_command.perform(options)

      expect(result).toMatch("Your sacrifice")
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
})
