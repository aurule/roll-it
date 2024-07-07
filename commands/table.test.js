const { setup, GuildRollables } = require("../db/rollable")
const { Interaction } = require("../testing/interaction")
const table_command = require("./table")

describe("execute", () => {
  beforeAll(() => {
    setup()
  })

  it("calls roll subcommand", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "roll"
    const contents = ["first"]
    rollables = new GuildRollables(interaction.guildId)
    const insertion = rollables.create("test", "a test", contents)
    interaction.command_options.table = insertion.lastInsertRowid.toString()

    await table_command.execute(interaction)

    expect(interaction.replyContent).toMatch("first")
  })

  it("calls list subcommand", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "list"
    const contents = ["first"]
    rollables = new GuildRollables(interaction.guildId)
    rollables.create("test", "a test", contents)

    await table_command.execute(interaction)

    expect(interaction.replyContent).toMatch("a test")
  })
})
