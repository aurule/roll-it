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
    const insertion = rollables.create("test", "a test", contents)
    interaction.command_options.table = insertion.lastInsertRowid.toString()

    await table_command.execute(interaction)

    expect(interaction.replyContent).toMatch("a test")
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

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = table_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = table_command.data()

    expect(command_data.name).toEqual(table_command.name)
  })
})

describe("help", () => {
  it("shows some help text", () => {
    const result = table_command.help({ command_name: "/table"})

    expect(result).toBeTruthy()
  })
})
