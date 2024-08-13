const {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js")
const help_command = require("../commands/help")
const CommandHelpPresenter = require("./command-help-presenter")

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

const test_command_bare = {
  name: "test-command",
  description: "A fake command for testing",
  data: () =>
    new SlashCommandBuilder()
      .setName("test-command-bare")
      .setDescription("A fake command for testing without options"),
  help: ({ command_name }) => "test bare help output",
}

const test_command_context = {
  name: "test-command",
  description: "A fake command for testing",
  data: () =>
    new ContextMenuCommandBuilder()
      .setName("test-command-bare")
      .setType(ApplicationCommandType.Message),
  help: ({ command_name }) => "test bare help output",
}

describe("present", () => {
  it("names the command in the output", () => {
    const result = CommandHelpPresenter.present(test_command)

    expect(result).toMatch("Showing help for")
    expect(result).toMatch(test_command.name)
  })

  it("shows the help output for the command", () => {
    const result = CommandHelpPresenter.present(test_command)

    expect(result).toMatch(test_command.help({ command_name: "test-command" }))
  })

  describe("with options", () => {
    it("uses correct label", () => {
      const result = CommandHelpPresenter.present(test_command)

      expect(result).toMatch("Args:")
    })

    it("shows the options", () => {
      const result = CommandHelpPresenter.present(test_command)

      expect(result).toMatch("Title description")
      expect(result).toMatch("Subtitle description")
    })

    it("marks required options", () => {
      const result = CommandHelpPresenter.present(test_command)

      expect(result).toMatch("(required) Title description")
    })
  })

  describe("with subcommands", () => {
    it("uses correct label", () => {
      const result = CommandHelpPresenter.present(help_command)

      expect(result).toMatch("Subcommands:")
    })

    it("shows the subcommands", () => {
      const result = CommandHelpPresenter.present(help_command)

      expect(result).toMatch("topic")
      expect(result).toMatch("command")
    })
  })

  describe("without options", () => {
    it("skips the Args section", () => {
      const result = CommandHelpPresenter.present(test_command_bare)

      expect(result).not.toMatch("Args")
    })
  })

  describe("with a context command", () => {
    it("skips the Args section", () => {
      const result = CommandHelpPresenter.present(test_command_context)

      expect(result).not.toMatch("Args")
    })
  })
})
