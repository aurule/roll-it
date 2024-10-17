const help_command = require("./help")
const { SlashCommandBuilder } = require("discord.js")

const { Interaction } = require("../testing/interaction")

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
  describe("topic subcommand", () => {
    it("shows the topic", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "topic"
      interaction.command_options.topic = "about"

      await help_command.execute(interaction)

      expect(interaction.replyContent).toMatch("passion project")
    })
  })

  describe("command subcommand", () => {
    it("shows the command", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "command"
      interaction.command_options.command = "test-command"
      interaction.client.commands.set("test-command", test_command)

      await help_command.execute(interaction)

      expect(interaction.replyContent).toMatch("test help output")
    })
  })
})

describe("help", () => {
  it("includes topic names", () => {
    const help_text = help_command.help({})

    expect(help_text).toMatch("About Roll It")
  })

  it("includes command names", () => {
    const help_text = help_command.help({})

    expect(help_text).toMatch("fate")
  })
})
