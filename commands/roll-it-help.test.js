const roll_it_help_command = require("./roll-it-help")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  describe("with a topic", () => {
    beforeEach(() => {
      interaction.command_options.command = undefined
      interaction.command_options.topic = "about"
    })

    it("displays the help for the topic", async () => {
      const result = await roll_it_help_command.execute(interaction)

      expect(result.content).toMatch("passion project")
    })

    it("warns the user if the topic isn't found", async () => {
      interaction.command_options.topic = "unknown"

      const result = await roll_it_help_command.execute(interaction)

      expect(result.content).toMatch("No help is available")
    })
  })

  describe("with a command", () => {
    beforeEach(() => {
      interaction.command_options.command = "test-command"
      interaction.command_options.topic = undefined
      interaction.client.commands.set("test-command", {
        name: "test-command",
        help: () => "test help",
      })
    })

    it("displays the help for the command", async () => {
      const result = await roll_it_help_command.execute(interaction)

      expect(result.content).toMatch("test help")
    })

    it("warns the user if the command isn't found", async () => {
      interaction.command_options.command = "unknown"

      const result = await roll_it_help_command.execute(interaction)

      expect(result.content).toMatch("No help is available")
    })
  })

  describe("with a topic and a command", () => {
    beforeEach(() => {
      interaction.command_options.command = "test-command"
      interaction.command_options.topic = "about"
      interaction.client.commands.set("test-command", {
        name: "test-command",
        help: () => "test help",
      })
    })

    it("displays the help for the topic", async () => {
      const result = await roll_it_help_command.execute(interaction)

      expect(result.content).toMatch("passion project")
    })
  })

  describe("with no inputs", () => {
    beforeEach(() => {
      interaction.command_options.command = undefined
      interaction.command_options.topic = undefined
      interaction.client.commands.set("roll-it-help", {
        name: "roll-it-help",
        help: () => "test help",
      })
    })

    it("displays its own help text", async () => {
      const result = await roll_it_help_command.execute(interaction)

      expect(result.content).toMatch("test help")
    })
  })
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = roll_it_help_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = roll_it_help_command.data()

    expect(command_data.name).toEqual(roll_it_help_command.name)
  })
})

describe("help", () => {
  it("includes the command name in the output", () => {
    const help_text = roll_it_help_command.help({command_name: "sillyness"})

    expect(help_text).toMatch("sillyness")
  })
})
