const fate_command = require("./fate")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("fate command", () => {
  var interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("judge", () => {
    describe("with dominant outcome", () => {
      it.each([
        [4, "pleases"],
        [2, "accepted"],
        [0, "noted"],
        [-2, "inadequate"],
        [-4, "angers"],
      ])("returns correct text for %i", (die, text) => {
        const results = [die]

        const result = fate_command.judge(results, "en-US")

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const results = [-4, 0, 4]

        const result = fate_command.judge(results, "en-US")

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      const description_text = "this is a test"
      const options = {
        description: description_text,
      }

      const result = fate_command.perform(options)

      expect(result).toMatch(description_text)
    })

    it("displays the modifier", () => {
      interaction.command_options.modifier = 8
      const options = {
        modifier: 8,
      }

      const result = fate_command.perform(options)

      expect(result).toMatch("8")
    })

    it("displays the sacrifice easter egg if present", () => {
      const description_text = "sacrificing a goat"
      const options = {
        description: description_text,
      }

      const result = fate_command.perform(options)

      expect(result).toMatch("Your sacrifice")
    })
  })

  test_secret_option(fate_command)
})
