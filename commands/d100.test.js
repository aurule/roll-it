const d100_command = require("./d100")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  describe("with one roll", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 1
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      d100_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch(description_text)
    })

    describe("secret", () => {
      it("when secret is true, reply is ephemeral", () => {
        interaction.command_options.secret = true

        d100_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeTruthy()
      })

      it("when secret is false, reply is not ephemeral", () => {
        interaction.command_options.secret = false

        d100_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })

      it("secret defaults to false", () => {
        d100_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })
    })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      d100_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch(description_text)
    })
  })
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = d100_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = d100_command.data()

    expect(command_data.name).toEqual(d100_command.name)
  })
})

describe("help", () => {
  it("includes the command name in the output", () => {
    const help_text = d100_command.help({ command_name: "sillyness" })

    expect(help_text).toMatch("sillyness")
  })
})
