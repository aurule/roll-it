const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../testing/interaction")
const saved_manage_command = require("./manage")

describe("execute", () => {
  var interaction
  var saved_rolls

  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    saved_rolls.create({
      name: "test",
      description: "test",
      command: "roll",
      options: {
        pool: 1,
        sides: 6,
      },
    })
  })

  it("warns on missing saved roll", async () => {
    interaction.command_options.name = "sir not appearing in this database"

    await saved_manage_command.execute(interaction)

    expect(interaction.replyContent).toMatch("does not exist")
  })

  it("shows roll info", async () => {
    interaction.command_options.name = "test"

    await saved_manage_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test")
    expect(interaction.replyContent).toMatch("_pool:_ 1")
  })

  it("prompts the user with actions", async () => {
    interaction.command_options.name = "sir not appearing in this database"

    await saved_manage_command.execute(interaction)

    expect(interaction.replies[0].components).toBeTruthy()
  })
})
