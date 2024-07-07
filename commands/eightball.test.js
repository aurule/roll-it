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
