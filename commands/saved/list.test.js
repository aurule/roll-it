const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../testing/interaction")

const saved_list_command = require("./list")

describe("execute", () => {
  it("shows all saved rolls for the user and guild", () => {
    const interaction = new Interaction()
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    saved_rolls.create({
      name: "test1",
      description: "test1",
      command: "d20",
      options: {},
    })
    saved_rolls.create({
      name: "test2",
      description: "test2",
      command: "d20",
      options: {},
    })

    saved_list_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test1")
    expect(interaction.replyContent).toMatch("test2")
  })

  it("shows a message when there are no saved rolls", () => {
    const interaction = new Interaction()

    saved_list_command.execute(interaction)

    expect(interaction.replyContent).toMatch("no saved rolls")
  })

  it("marks incomplete roll", () => {
    const interaction = new Interaction()
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    saved_rolls.create({
      name: "test1",
      description: "test1",
      incomplete: true,
    })

    saved_list_command.execute(interaction)

    expect(interaction.replyContent).toMatch(":memo:")
  })

  it("marks invalid rolls", () => {
    const interaction = new Interaction()
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    saved_rolls.create({
      name: "test1",
      description: "test1",
      invalid: true,
      command: "d20",
      options: {
        keep: "all the things",
      },
    })

    saved_list_command.execute(interaction)

    expect(interaction.replyContent).toMatch(":x:")
  })
})
