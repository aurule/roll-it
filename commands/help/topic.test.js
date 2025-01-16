const topic_help_command = require("./topic")

const { Interaction } = require("../../testing/interaction")

describe("execute", () => {
  describe("with a valid topic name", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "topic"
      interaction.command_options.topic = "about"
    })

    it("shows the topic title", async () => {
      await topic_help_command.execute(interaction)

      expect(interaction.replyContent).toMatch("About Roll It")
    })

    it("shows the topic body", async () => {
      await topic_help_command.execute(interaction)

      expect(interaction.replyContent).toMatch("passion project")
    })
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
    const help_data = topic_help_command.help_data()

    expect(help_data.topics.some(c => c.includes("About Roll It"))).toBeTruthy()
  })
})
