const { setup, GuildRollables } = require("../../db/rollable")
const { Interaction } = require("../../testing/interaction")
const table_manage_command = require("./manage")

describe("execute", () => {
  beforeAll(() => {
    setup()
  })

  var interaction
  var rollables
  var table_id

  beforeEach(() => {
    interaction = new Interaction()
    interaction.command_options.subcommand_name = "manage"
    rollables = new GuildRollables(interaction.guildId)
    const insertion = rollables.create("test", "a test", ["first"])
    table_id = insertion.lastInsertRowid
  })

  it("warns on missing table", async () => {
    interaction.command_options.table = 0

    await table_manage_command.execute(interaction)

    expect(interaction.replyContent).toMatch("does not exist")
  })

  it("shows table info", async () => {
    interaction.command_options.table = table_id

    await table_manage_command.execute(interaction)

    expect(interaction.replyContent).toMatch("_Name:_ test")
    expect(interaction.replyContent).toMatch("1")
  })

  it("prompts the user with actions", async () => {
    interaction.command_options.table = table_id

    await table_manage_command.execute(interaction)

    expect(interaction.replies[0].components).toBeTruthy()
  })

  it.todo("show contents shows full table")

  it.todo("remove table deletes the table")
})
