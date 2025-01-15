const eightball_command = require("../../commands/8ball")
const command_help_command = require("./command")

const { Interaction } = require("../../testing/interaction")

describe("execute", () => {
  it("with a known command, it shows its help", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "command"
    interaction.command_options.command = "8ball"
    interaction.client.commands.set("8ball", eightball_command)

    await command_help_command.execute(interaction)

    expect(interaction.replyContent).toMatch("Magic 8 Ball")
  })

  it("with an unknown command, it shows no help", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "command"
    interaction.command_options.command = "fake-command"

    await command_help_command.execute(interaction)

    expect(interaction.replyContent).toMatch("No help is available")
  })

  it("without a command, it shows no help", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "command"

    await command_help_command.execute(interaction)

    expect(interaction.replyContent).toMatch("No help is available")
  })
})

describe("help", () => {
  it("includes command names", () => {
    const help_text = command_help_command.help({})

    expect(help_text).toMatch("setup-roll-it")
  })
})
