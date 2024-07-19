const fate_command = require("./fate")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("perform", () => {
  it("displays the description if present", () => {
    const description_text = "this is a test"
    const options = {
      description: description_text
    }

    const result = fate_command.perform(options)

    expect(result).toMatch(description_text)
  })

  it("displays the modifier", () => {
    interaction.command_options.modifier = 8
    const options = {
      modifier: 8
    }

    const result = fate_command.perform(options)

    expect(result).toMatch("8")
  })
})

describe("execute", () => {
  describe("secret", () => {
    it("when secret is true, reply is ephemeral", () => {
      interaction.command_options.secret = true

      fate_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", () => {
      interaction.command_options.secret = false

      fate_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", () => {
      fate_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
