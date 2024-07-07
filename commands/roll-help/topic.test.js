const topic_help_command = require("./topic")

const { Interaction } = require("../../testing/interaction")

describe("execute", () => {
  it("with a topic name, shows the topic", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "topic"
    interaction.command_options.topic = "about"

    await topic_help_command.execute(interaction)

    expect(interaction.replyContent).toMatch("passion project")
  })

  it("without a topic name, shows no help", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "topic"

    await topic_help_command.execute(interaction)

    expect(interaction.replyContent).toMatch("No help is available")
  })

  it("with an unknown topic name, shows no help", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "topic"
    interaction.command_options.topic = "trickery"

    await topic_help_command.execute(interaction)

    expect(interaction.replyContent).toMatch("No help is available")
  })
})

describe("help", () => {
  it("includes topic names", () => {
    const help_text = topic_help_command.help({})

    expect(help_text).toMatch("About Roll It")
  })
})
