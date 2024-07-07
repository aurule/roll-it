const { setup, GuildRollables } = require("../db/rollable")
const { Interaction } = require("../testing/interaction")
const { Attachment } = require("../testing/attachment")
const tables_command = require("./tables")

describe("execute", () => {
  beforeAll(() => {
    setup()
  })

  it("calls add subcommand", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve({
        text: () => "hello"
      }))

    const interaction = new Interaction()
    interaction.command_options.subcommand_name = "add"
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test table"
    interaction.command_options.file = new Attachment({
      contentType: "text/plain",
      contents: "first\nsecond\nthird"
    })

    await tables_command.execute(interaction)

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

    await tables_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test")
  })
})
