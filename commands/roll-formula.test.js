const roll_formula_command = require("./roll-formula")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  beforeEach(() => {
    interaction.command_options.formula = "1d4 + 8"
  })

  it("displays the description if present", async () => {
    const description_text = "this is a test"
    interaction.command_options.description = description_text

    const result = await roll_formula_command.execute(interaction)

    expect(result.content).toMatch(description_text)
  })

  it("displays the result", async () => {
    const result = await roll_formula_command.execute(interaction)

    expect(result.content).toMatch(/\*\*\d+\*\*/)
  })

  it("displays the rest of the formula", async () => {
    const result = await roll_formula_command.execute(interaction)

    expect(result.content).toMatch("8")
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      const result = await roll_formula_command.execute(interaction)

      expect(result.ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      const result = await roll_formula_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      const result = await roll_formula_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })
  })
})
