const { setup, GuildRollables } = require("../../db/rollable")
const { Interaction } = require("../../testing/interaction")
const { Attachment } = require("../../testing/attachment")
const attachment_lines = require("../../util/attachment-lines")

describe("execute", () => {
  beforeAll(() => {
    setup()

    fetchMock = jest
      .spyOn(attachment_lines, "fetchLines")
      .mockImplementation((attachment) => attachment.contents.split(/\n/))

    table_add_command = require("./add")
  })

  afterAll(() => {
    fetchMock.mockRestore()
  })

  var fetchMock
  var interaction
  var rollables
  var table_add_command

  beforeEach(() => {
    interaction = new Interaction()
    interaction.command_options.subcommand_name = "add"
    rollables = new GuildRollables(interaction.guildId)
  })

  it("warns on name collision", async () => {
    rollables.create("test", "a test", ["first"])
    interaction.command_options.name = "test"

    await table_add_command.execute(interaction)

    expect(interaction.replyContent).toMatch("pick a different name")
  })

  it("warns on bad attachment type", async () => {
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test"
    interaction.command_options.file = new Attachment({
      contentType: "image/png",
      contents: "",
    })

    await table_add_command.execute(interaction)

    expect(interaction.replyContent).toMatch("does not look like a plain text file")
  })

  it("warns on short contents", async () => {
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test"
    interaction.command_options.file = new Attachment({
      contentType: "text/plain",
      contents: "first",
    })

    await table_add_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not have enough lines")
  })

  it("adds a table for the interaction's guild", async () => {
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test"
    interaction.command_options.file = new Attachment({
      contentType: "text/plain",
      contents: "first\nsecond\nthird",
    })

    await table_add_command.execute(interaction)

    const table = rollables.detail(undefined, "test")
    expect(table).toBeTruthy()
  })

  it("announces the new table", async () => {
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test"
    interaction.command_options.file = new Attachment({
      contentType: "text/plain",
      contents: "first\nsecond\nthird",
    })

    await table_add_command.execute(interaction)

    expect(interaction.replyContent).toMatch("created the table")
  })

  it("announcement is ephemeral if quiet", async () => {
    interaction.command_options.name = "test"
    interaction.command_options.description = "a test"
    interaction.command_options.file = new Attachment({
      contentType: "text/plain",
      contents: "first\nsecond\nthird",
    })
    interaction.command_options.quiet = true

    await table_add_command.execute(interaction)

    expect(interaction.replies[0].ephemeral).toBeTruthy()
  })
})
