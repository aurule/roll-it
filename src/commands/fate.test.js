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
      it("returns the correct message", () => {
        const results = [4]

        const result = fate_command.judge(results, "en-US")

        expect(result).toMatch("pleases")
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
  })

  test_secret_option(fate_command)
})
