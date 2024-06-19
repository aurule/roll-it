const roll_help_command = require("./roll-help")
const { SlashCommandBuilder } = require("discord.js")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

const test_command = {
  name: "test-command",
  description: "A fake command for testing",
  data: () =>
    new SlashCommandBuilder()
      .setName("test-command")
      .setDescription("A fake command for testing")
      .addStringOption((option) =>
        option.setName("title").setDescription("Title description").setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("subtitle").setDescription("Subtitle description"),
      ),
  help: ({ command_name }) => "test help output",
}

const long_command = {
  name: "long-command",
  description: "A fake command for testing with a very long help string",
  data: () =>
    new SlashCommandBuilder()
      .setName("test-command")
      .setDescription("A fake command for testing with big help")
      .addStringOption((option) =>
        option.setName("title").setDescription("Title description").setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("subtitle").setDescription("Subtitle description"),
      ),
  help: ({ command_name }) => "adriatic sea".repeat(200),
}

describe("execute", () => {
  describe("with a topic", () => {
    beforeEach(() => {
      interaction.command_options.command = undefined
      interaction.command_options.topic = "about"
    })

    it("displays the help for the topic", () => {
      roll_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("passion project")
    })

    it("warns the user if the topic isn't found", () => {
      interaction.command_options.topic = "unknown"

      roll_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("No help is available")
    })
  })

  describe("with a command", () => {
    beforeEach(() => {
      interaction.command_options.command = "test-command"
      interaction.command_options.topic = undefined
      interaction.client.commands.set("test-command", test_command)
    })

    it("displays the help for the command", () => {
      roll_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("test help")
    })

    it("warns the user if the command isn't found", () => {
      interaction.command_options.command = "unknown"

      roll_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("No help is available")
    })
  })

  describe("with a topic and a command", () => {
    beforeEach(() => {
      interaction.command_options.command = "test-command"
      interaction.command_options.topic = "about"
      interaction.client.commands.set("test-command", test_command)
    })

    it("displays the help for the topic", () => {
      roll_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("passion project")
    })
  })

  describe("with no inputs", () => {
    beforeEach(() => {
      interaction.command_options.command = undefined
      interaction.command_options.topic = undefined
      interaction.client.commands.set("roll-help", {
        name: "roll-help",
        description: "Get help",
        data: () =>
          new SlashCommandBuilder()
            .setName("roll-help")
            .setDescription("A fake command for testing")
            .addStringOption((option) =>
              option.setName("title").setDescription("Title description").setRequired(true),
            ),
        help: () => "test help",
      })
    })

    it("displays its own help text", () => {
      roll_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("test help")
    })
  })
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = roll_help_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = roll_help_command.data()

    expect(command_data.name).toEqual(roll_help_command.name)
  })
})

describe("help", () => {
  it("includes topic names", () => {
    const help_text = roll_help_command.help({})

    expect(help_text).toMatch("About Roll It")
  })

  it("includes command names", () => {
    const help_text = roll_help_command.help({})

    expect(help_text).toMatch("roll-chooser")
  })
})
