const fate_command = require("./fate")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
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
