const { GuildRollables } = require("../../db/rollable")
const { Interaction } = require("../../../testing/interaction")
const table_list_command = require("./list")

describe("execute", () => {
  it("shows table names", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "list"
    const contents = ["first"]
    const rollables = new GuildRollables(interaction.guildId)
    rollables.create("test1", "a test", contents)
    rollables.create("test2", "a test", contents)

    await table_list_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test1")
    expect(interaction.replyContent).toMatch("test2")
  })

  it("shows table descriptions", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "list"
    const contents = ["first"]
    const rollables = new GuildRollables(interaction.guildId)
    rollables.create("test1", "test desc 1", contents)
    rollables.create("test2", "test desc 2", contents)

    await table_list_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test desc 1")
    expect(interaction.replyContent).toMatch("test desc 2")
  })
})
