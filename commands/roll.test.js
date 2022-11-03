const roll_command = require('./roll')
const baseRoller = require('../services/base-roller')

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  describe("with one roll", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 1
      interaction.command_options.pool = 1
      interaction.command_options.sides = 2
    })

    it("displays the description if present", async () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      const result = await roll_command.execute(interaction)

      expect(result.content).toMatch(description_text)
    })

    it("displays the result", async () => {
      const result = await roll_command.execute(interaction)

      expect(result.content).toMatch(/\*\*\d\*\*/)
    })

    it("displays the modifier", async () => {
      interaction.command_options.modifier = 8

      const result = await roll_command.execute(interaction)

      expect(result.content).toMatch("8")
    })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
      interaction.command_options.pool = 1
      interaction.command_options.sides = 2
    })

    it("displays the description if present", async () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      const result = await roll_command.execute(interaction)

      expect(result.content).toMatch(description_text)
    })

    it("displays the result", async () => {
      const result = await roll_command.execute(interaction)

      expect(result.content).toMatch(/\*\*\d\*\*/)
    })

    it("displays the modifier", async () => {
      interaction.command_options.modifier = 8

      const result = await roll_command.execute(interaction)

      expect(result.content).toMatch("8")
    })
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      const result = await roll_command.execute(interaction)

      expect(result.ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      const result = await roll_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })
  })
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = roll_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = roll_command.data()

    expect(command_data.name).toEqual(roll_command.name)
  })
})

describe("help", () => {
  it("includes the command name in the output", () => {
    const help_text = roll_command.help({command_name: "sillyness"})

    expect(help_text).toMatch("sillyness")
  })
})
