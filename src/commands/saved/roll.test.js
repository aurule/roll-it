const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../../testing/interaction")
const { test_secret_option } = require("../../../testing/shared/execute-secret")

const saved_roll_command = require("./roll")

describe("execute", () => {
  var interaction
  var saved_rolls

  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  it("warns on unknown roll", async () => {
    interaction.command_options.name = "nope"

    await saved_roll_command.execute(interaction)

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

    await saved_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not valid")
  })

  it("warns on incomplete", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
      incomplete: true,
    })
    interaction.command_options.name = "test"

    await saved_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not finished")
  })

  it("executes the roll", async () => {
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

    await saved_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("rolled")
  })

  it("warns and marks the saved roll invalid if saved options are bad", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
      command: "roll",
      options: {
        pool: 0,
        sides: 6,
      },
    })
    interaction.command_options.name = "test"

    await saved_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("no longer valid")
    const detail = saved_rolls.detail(undefined, "test")
    expect(detail.invalid).toBeTruthy()
  })

  describe("with a bonus", () => {
    it("adds the bonus to the automatic option", async () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
          modifier: 6,
        },
      })
      interaction.command_options.name = "test"
      interaction.command_options.bonus = 2

      await saved_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("+ 8")
    })

    it("shows the bonus in the description", async () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
          modifier: 6,
        },
      })
      interaction.command_options.name = "test"
      interaction.command_options.bonus = 2

      await saved_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("test + 2")
    })

    it("adds the bonus to the chosen option", async () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
          modifier: 6,
        },
      })
      interaction.command_options.name = "test"
      interaction.command_options.bonus = 2
      interaction.command_options.change = "pool"

      await saved_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("3d6")
    })

    it("validates the modified options", async () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
          modifier: 6,
        },
      })
      interaction.command_options.name = "test"
      interaction.command_options.bonus = -1
      interaction.command_options.change = "pool"

      await saved_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("can no longer")
    })
  })

  describe("with rolls", () => {
    it("overrides the saved rolls number", async () => {
      saved_rolls.create({
        name: "test",
        description: "test",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
          modifier: 6,
          rolls: 3,
        },
      })
      interaction.command_options.name = "test"
      interaction.command_options.rolls = 2

      await saved_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("2 times")
    })
  })
})

describe("change_target", () => {
  it("is undefined with no bonus", () => {
    const bonus = 0
    const change = undefined
    const changeable = ["modifier"]

    const result = saved_roll_command.change_target(bonus, change, changeable)

    expect(result).toBeUndefined()
  })

  describe("with a named option", () => {
    it("returns the option if it's in the list", () => {
      const bonus = 1
      const change = "pool"
      const changeable = ["modifier", "pool"]

      const result = saved_roll_command.change_target(bonus, change, changeable)

      expect(result).toMatch("pool")
    })

    it("returns the first changeable entry if it's not in the list", () => {
      const bonus = 1
      const change = "nope"
      const changeable = ["modifier", "pool"]

      const result = saved_roll_command.change_target(bonus, change, changeable)

      expect(result).toMatch("modifier")
    })
  })

  describe("without a named option", () => {
    it("returns the first changeable entry", () => {
      const bonus = 1
      const changeable = ["modifier", "pool"]

      const result = saved_roll_command.change_target(bonus, undefined, changeable)

      expect(result).toMatch("modifier")
    })
  })
})
