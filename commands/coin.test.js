const coin_command = require("./coin")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  it("displays the description if present", async () => {
    const description_text = "this is a test"
    interaction.command_options.description = description_text

    const result = await coin_command.execute(interaction)

    expect(result.content).toMatch(description_text)
  })

  it("displays the call if present", async () => {
    interaction.command_options.call = "heads"

    const result = await coin_command.execute(interaction)

    expect(result.content).toMatch("called heads")
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      const result = await coin_command.execute(interaction)

      expect(result.ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      const result = await coin_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      const result = await coin_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })
  })
})
