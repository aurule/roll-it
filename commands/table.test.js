const { setup, GuildRollables } = require("../db/rollable")
const { Interaction } = require("../testing/interaction")
const { Attachment } = require("../testing/attachment")
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

  it("calls add subcommand", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        text: () => "hello\nthere",
      }),
    )

    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "add"
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test table"
    interaction.command_options.file = new Attachment({
      contentType: "text/plain",
      contents: "first\nsecond\nthird",
    })

    await table_command.execute(interaction)

    expect(interaction.replyContent).toMatch("created the table")

    fetchMock.mockRestore()
  })

  it("calls manage subcommand", async () => {
    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "manage"
    const contents = ["first"]
    rollables = new GuildRollables(interaction.guildId)
    const insertion = rollables.create("test", "a test", contents)
    interaction.command_options.table = insertion.lastInsertRowid.toString()

    await table_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test")
  })
})
