const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../../testing/interaction")
const { test_secret_option } = require("../../../testing/shared/execute-secret")

const saved_grow_command = require("./grow")

describe("execute", () => {
  var interaction
  var saved_rolls

  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  it("warns on unknown roll", async () => {
    interaction.command_options.name = "nope"

    await saved_grow_command.execute(interaction)

    expect(interaction.replyContent).toMatch("does not exist")
  })

  it("warns on invalid", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
      command: "roll",
      options: {
        pool: 0,
        sides: 6,
      },
      invalid: true,
    })
    interaction.command_options.name = "test"

    await saved_grow_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not valid")
  })

  it("warns on zero adjustment", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
      command: "roll",
      options: {
        pool: 1,
        sides: 6,
      },
    })
    interaction.command_options.name = "test"

    await saved_grow_command.execute(interaction)

    expect(interaction.replyContent).toMatch("won't change")
  })

  it("warns if the changed roll is invalid", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
      command: "roll",
      options: {
        pool: 1,
        sides: 6,
      },
    })
    interaction.command_options.name = "test"
    interaction.command_options.adjustment = -1
    interaction.command_options.change = "pool"

    await saved_grow_command.execute(interaction)

    expect(interaction.replyContent).toMatch("be invalid")
  })

  it("updates the roll", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
      command: "roll",
      options: {
        pool: 1,
        sides: 6,
      },
    })
    interaction.command_options.name = "test"
    interaction.command_options.adjustment = 3
    interaction.command_options.change = "modifier"

    await saved_grow_command.execute(interaction)

    const details = saved_rolls.detail(undefined, "test")
    expect(details.options.modifier).toEqual(3)
  })
})

describe("change_target", () => {
  describe("with a named option", () => {
    it("returns the option if it's in the list", () => {
      const bonus = 1
      const change = "pool"
      const changeable = ["modifier", "pool"]

      const result = saved_grow_command.change_target(bonus, change, changeable)

      expect(result).toMatch("pool")
    })

    it("returns the first changeable entry if it's not in the list", () => {
      const bonus = 1
      const change = "nope"
      const changeable = ["modifier", "pool"]

      const result = saved_grow_command.change_target(bonus, change, changeable)

      expect(result).toMatch("modifier")
    })
  })

  describe("without a named option", () => {
    it("returns the first changeable entry", () => {
      const bonus = 1
      const changeable = ["modifier", "pool"]

      const result = saved_grow_command.change_target(bonus, undefined, changeable)

      expect(result).toMatch("modifier")
    })
  })
})
