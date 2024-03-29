const eightball_command = require("./eightball")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  it("displays the question", async () => {
    const question_text = "this is a test"
    interaction.command_options.question = question_text

    const result = await eightball_command.execute(interaction)

    expect(result.content).toMatch(question_text)
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      const result = await eightball_command.execute(interaction)

      expect(result.ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      const result = await eightball_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      const result = await eightball_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })
  })
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = eightball_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = eightball_command.data()

    expect(command_data.name).toEqual(eightball_command.name)
  })
})

describe("help", () => {
  it("includes the command name in the output", () => {
    const help_text = eightball_command.help({ command_name: "sillyness" })

    expect(help_text).toMatch("sillyness")
  })
})
