const path = require("path")
const { Collection } = require("discord.js")
const { Interaction } = require("../testing/interaction")
const helpers = require("./subcommands")

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
  execute(interaction) {
    return "did the thing"
  },
  help: ({ command_name }) => "test help output",
}

describe("loadSubcommands", () => {
  it("stores subcommands by name", () => {
    const result = helpers.loadSubcommands("help")

    expect(result.has("topic")).toBeTruthy()
  })

  it("loads each file in the target dir", () => {
    const result = helpers.loadSubcommands("help")

    expect(result.hasAll("command", "topic")).toBeTruthy()
  })
})

describe("dispatch", () => {
  it("calls the named subcommand", () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "test-command"
    const subcommands = new Collection([["test-command", test_command]])

    const result = helpers.dispatch(interaction, subcommands)

    expect(result).toEqual("did the thing")
  })

  it("shows an error for bad subcommand", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "nothin"
    const subcommands = new Collection()

    const result = await helpers.dispatch(interaction, subcommands)

    expect(result.content).toMatch("went wrong")
  })
})
