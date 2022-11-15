const CommandHelpPresenter = require("./command-help-presenter")
const { SlashCommandBuilder } = require("discord.js")

const test_command = {
  name: "test-command",
  description: "A fake command for testing",
  data: () =>
    new SlashCommandBuilder()
      .setName("test-command")
      .setDescription("A fake command for testing")
      .addStringOption((option) =>
        option
          .setName("title")
          .setDescription("Title description")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("subtitle").setDescription("Subtitle description")
      ),
  help: ({ command_name }) => "test help output",
}

describe("present", () => {
  it("names the command in the output", () => {
    const result = CommandHelpPresenter.present(test_command)

    expect(result).toMatch("Showing help for")
    expect(result).toMatch(test_command.name)
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

  it("shows the help output for the command", () => {
    const result = CommandHelpPresenter.present(test_command)

    expect(result).toMatch(test_command.help({ command_name: "test-command" }))
  })
})
