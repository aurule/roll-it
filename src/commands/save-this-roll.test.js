const { UserSavedRolls } = require("../db/saved_rolls")
const { Interaction } = require("../../testing/interaction")
const interactionCache = require("../services/interaction-cache")

const save_roll_command = require("./save-this-roll")

require("dotenv").config()
const botId = process.env.CLIENT_ID

describe("execute", () => {
  let interaction
  let past_interaction
  let saved_rolls
  beforeEach(() => {
    interaction = new Interaction()
    past_interaction = new Interaction(interaction.guildId)
    interaction.targetMessage = {
      guildId: interaction.guildId,
      interactionMetadata: {
        id: past_interaction.id,
      },
      author: { id: botId },
    }
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  const cacheCommand = (commandName, commandOptions = {}) => {
    past_interaction.commandName = commandName
    past_interaction.options.data = Object.entries(commandOptions).map(([name, value]) => ({
      name,
      value,
    }))
    interactionCache.store(past_interaction)
  }

  it("warns on bad author ID", async () => {
    interaction.targetMessage.author.id = "wasnt_me"

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("not sent by a Roll It command")
  })

  it("warns on cache miss", async () => {
    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("cannot be found")
  })

  it("warns on non-savable command", async () => {
    cacheCommand("chop")

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("cannot be saved")
  })

  it("warns on invalid options", async () => {
    cacheCommand("d20", { keep: "none" })

    await save_roll_command.execute(interaction)

    expect(interaction.replyContent).toMatch("options cannot be saved")
  })

  describe("with no incomplete roll", () => {
    beforeEach(() => {
      cacheCommand("d10", { modifier: 4 })
    })

    it("saves the command", async () => {
      await save_roll_command.execute(interaction)

      const detail = saved_rolls.incomplete()
      expect(detail.command).toMatch("d10")
    })

    it("saves the options", async () => {
      await save_roll_command.execute(interaction)

      const detail = saved_rolls.incomplete()
      expect(detail.options).toMatchObject({ modifier: 4 })
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

    it("skips description option", async () => {
      cacheCommand("d10", { modifier: 3, description: "something" })

      await save_roll_command.execute(interaction)

      const detail = saved_rolls.incomplete()
      expect(detail.options.description).toBeUndefined()
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

        cacheCommand("d10", { modifier: 4 })
      })

      it("saves the command", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test")
        expect(detail.command).toMatch("d10")
      })

      it("saves the options", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test")
        expect(detail.options).toMatchObject({ modifier: 4 })
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
      let record_id

      beforeEach(() => {
        const created = saved_rolls.create({
          command: "wod20",
          options: {
            pool: 7,
          },
          incomplete: true,
        })
        record_id = created.lastInsertRowid

        cacheCommand("d10", { modifier: 4 })
      })

      it("overwrites the command", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(record_id)
        expect(detail.command).toMatch("d10")
      })

      it("overwrites the options", async () => {
        await save_roll_command.execute(interaction)

        const detail = saved_rolls.detail(record_id)
        expect(detail.options).toMatchObject({ modifier: 4 })
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
