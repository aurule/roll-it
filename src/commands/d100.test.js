const d100_command = require("./d100")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("perform", () => {
  it("displays the description if present", () => {
    const options = {
      description: "this is a test",
    }

    const result = d100_command.perform(options)

    expect(result).toMatch("this is a test")
  })
})

describe("execute", () => {
  describe("with one roll", () => {
    test_secret_option(d100_command, { rolls: 1 })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      d100_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })
  })
})
