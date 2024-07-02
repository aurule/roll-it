const command_help_command = require("./command")
const { SlashCommandBuilder } = require("discord.js")

const { Interaction } = require("../../testing/interaction")

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

describe("execute", () => {
  it("with a known command, it shows its help", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "command"
      interaction.command_options.command = "test-command"
      interaction.client.commands.set("test-command", test_command)

      await command_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("test help output")
  })

  it("with an unknown command, it shows no help", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "command"
      interaction.command_options.command = "fake-command"

      await command_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("No help is available")
  })

  it("without a command, it shows no help", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "command"

      await command_help_command.execute(interaction)

      expect(interaction.replies[0].content).toMatch("No help is available")
  })
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = command_help_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = command_help_command.data()

    expect(command_data.name).toEqual(command_help_command.name)
  })
})

describe("help", () => {
  it("includes command names", () => {
    const help_text = command_help_command.help({})

    expect(help_text).toMatch("roll-chooser")
  })
})
