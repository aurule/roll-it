const { UserSavedRolls } = require("../db/saved_rolls")
const { Interaction } = require("../testing/interaction")

const save_roll_command = require("./save-this-roll")

describe("execute", () => {
  let interaction
  let saved_rolls
  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  it("warns on no command", async () => {
    interaction.targetMessage = {
      content: "lorem ipsum"
    }

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not sent by a Roll It command")
  })

  it("warns on unknown command", async () => {
    interaction.targetMessage = {
      interaction: {commandName: "gobbledegook"},
      content: "lorem ipsum"
    }

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not sent by a Roll It command")
  })

  it("warns on non-savable command", async () => {
    interaction.targetMessage = {
      interaction: {commandName: "chop"},
      content: "lorem ipsum"
    }

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("cannot be saved")
  })

  it("warns on invalid options", async () => {
    interaction.targetMessage = {
      interaction: {commandName: "d10"},
      content: "0 times"
    }

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("problem saving")
  })

  describe("with no incomplete roll", () => {
    beforeEach(() => {
      interaction.targetMessage = {
        interaction: {commandName: "d10"},
        content: '<@12345> rolled **7** (3 + 4) for "a roll"',
      }
    })

    it("saves the command", async () => {
      await save_roll_command.execute(interaction)

      const detail = saved_rolls.incomplete()
      expect(detail.command).toMatch("d10")
    })

    it("saves the options", async () => {
      await save_roll_command.execute(interaction)

      const detail = saved_rolls.incomplete()
      expect(detail.options).toMatchObject({modifier: 4})
    })

    it("marks the record incomplete", async () => {
      await save_roll_command.execute(interaction)

      const detail = saved_rolls.incomplete()
      expect(detail.incomplete).toBeTruthy()
    })

    it("responds with instructions to finish the saved roll", async () => {
      await save_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("set its name and description")
    })
  })

  describe("with an incomplete roll", () => {
    describe("with name and description", () => {
      var record_id

      beforeEach(() => {
        const created = saved_rolls.create({
          name: "test",
          description: "test",
          incomplete: true,
        })
        record_id = created.lastInsertRowid

        interaction.targetMessage = {
          interaction: {commandName: "d10"},
          content: '<@12345> rolled **7** (3 + 4) for "a roll"',
        }
      })

      it("saves the command", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test")
        expect(detail.command).toMatch("d10")
      })

      it("saves the options", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test")
        expect(detail.options).toMatchObject({modifier: 4})
      })

      it("marks the record complete", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test")
        expect(detail.incomplete).toBeFalsy()
      })

      it("responds with instructions to use the saved roll", async () => {
        await save_roll_command.execute(interaction)

        expect(interaction.replyContent).toMatch("saved the roll")
      })
    })

    describe("with command and options", () => {
      var record_id

      beforeEach(() => {
        const created = saved_rolls.create({
          command: "wod20",
          options: {
            pool: 7,
          },
          incomplete: true,
        })
        record_id = created.lastInsertRowid

        interaction.targetMessage = {
          interaction: {commandName: "d10"},
          content: '<@12345> rolled **7** (3 + 4) for "a roll"',
        }
      })

      it("overwrites the command", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(record_id)
        expect(detail.command).toMatch("d10")
      })

      it("overwrites the options", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(record_id)
        expect(detail.options).toMatchObject({modifier: 4})
      })

      it("leaves the record incomplete", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(record_id)
        expect(detail.incomplete).toBeTruthy()
      })

      it("responds with instructions to finish the saved roll", async () => {
        await save_roll_command.execute(interaction)

        expect(interaction.replyContent).toMatch("set its name and description")
      })
    })
  })
})
