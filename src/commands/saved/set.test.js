const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../../testing/interaction")

const set_command = require("./set")

describe("execute", () => {
  let interaction
  let saved_rolls
  beforeEach(() => {
    interaction = new Interaction()
    saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
  })

  it("warns on name collision", async () => {
    saved_rolls.create({
      name: "test",
      description: "test",
    })
    interaction.command_options.name = "test"

    await set_command.execute(interaction)

    expect(interaction.replyContent).toMatch("already have a saved roll")
  })

  describe("with no incomplete roll", () => {
    describe("with no invocation", () => {
      beforeEach(() => {
        interaction.command_options.name = "test roll"
        interaction.command_options.description = "test description"
      })

      it("saves the name", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.name).toMatch("test roll")
      })

      it("saves the description", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.description).toMatch("test description")
      })

      it("marks the roll incomplete", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.incomplete).toBeTruthy()
      })

      it("responds with instructions to finish the saved roll", async () => {
        await set_command.execute(interaction)

        expect(interaction.replyContent).toMatch("add that command")
      })
    })

    describe("with an invocation", () => {
      beforeEach(() => {
        interaction.command_options.name = "test roll"
        interaction.command_options.description = "test description"
        interaction.command_options.invocation = "/fate modifier:3"
      })

      it("warns on unknown command", async () => {
        interaction.command_options.invocation = "/nope modifier:3"

        await set_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot save")
      })

      it("warns on non-savable command", async () => {
        interaction.command_options.invocation = "/coin"

        await set_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot save")
      })

      it("warns on invalid options", async () => {
        interaction.command_options.invocation = "/fate fake:true"

        await set_command.execute(interaction)

        expect(interaction.replyContent).toMatch("not allowed")
      })

      it("saves the name", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.name).toMatch("test roll")
      })

      it("saves the description", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.description).toMatch("test description")
      })

      it("saves the command", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.command).toMatch("fate")
      })

      it("saves the options", async () => {
        await set_command.execute(interaction)

        const detail = saved_rolls.detail(undefined, "test roll")
        expect(detail.options).toMatchObject({
          modifier: 3,
        })
      })

      it("responds with instructions to use the saved roll", async () => {
        await set_command.execute(interaction)

        expect(interaction.replyContent).toMatch("Try it out")
      })
    })
  })

  describe("with an incomplete roll", () => {
    describe("that has name and description", () => {
      var record_id

      beforeEach(() => {
        const created = saved_rolls.create({
          name: "test",
          description: "test",
          incomplete: true,
        })
        record_id = created.lastInsertRowid
      })

      describe("with no invocation", () => {
        beforeEach(() => {
          interaction.command_options.name = "new name"
          interaction.command_options.description = "new description"
        })

        it("overwrites the name", async () => {
          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.name).toMatch("new name")
        })

        it("overwrites the description", async () => {
          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.description).toMatch("new description")
        })

        it("leaves the roll incomplete", async () => {
          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.incomplete).toBeTruthy()
        })

        it("responds with instructions to finish the saved roll", async () => {
          await set_command.execute(interaction)

          expect(interaction.replyContent).toMatch("add that command")
        })

        it("ignores name collision with incomplete record", async () => {
          interaction.command_options.name = "test"

          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.description).toMatch("new description")
        })

        it("warns on name collision with other record", async () => {
          saved_rolls.create({
            name: "other",
          })
          interaction.command_options.name = "other"

          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.name).toMatch("test")
          expect(interaction.replyContent).toMatch("pick a different name")
        })
      })

      describe("with an invocation", () => {
        // the rest of this behavior is identical to what's tested in `with no incomplete roll` -> `with an invocation`
        beforeEach(() => {
          interaction.command_options.name = "new name"
          interaction.command_options.description = "new description"
          interaction.command_options.invocation = "/d20 modifier:8"
        })

        it("creates a new record", async () => {
          await set_command.execute(interaction)

          const unfinished = saved_rolls.detail(record_id)
          expect(unfinished.name).toMatch("test")
          expect(saved_rolls.count()).toEqual(2)
        })
      })
    })

    describe("that has command and options", () => {
      var record_id

      beforeEach(() => {
        const created = saved_rolls.create({
          command: "d10",
          options: {
            modifier: 8,
          },
          incomplete: true,
        })
        record_id = created.lastInsertRowid
      })

      describe("with no invocation", () => {
        beforeEach(() => {
          interaction.command_options.name = "new name"
          interaction.command_options.description = "new description"
        })

        it("saves the name", async () => {
          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.name).toMatch("new name")
        })

        it("saves the description", async () => {
          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.description).toMatch("new description")
        })

        it("marks roll as complete", async () => {
          await set_command.execute(interaction)

          const detail = saved_rolls.detail(record_id)
          expect(detail.incomplete).toBeFalsy()
        })

        it("responds with instructions to use the saved roll", async () => {
          await set_command.execute(interaction)

          expect(interaction.replyContent).toMatch("Try it out")
        })
      })

      describe("with an invocation", () => {
        // the rest of this behavior is identical to what's tested in `with no incomplete roll` -> `with an invocation`
        beforeEach(() => {
          interaction.command_options.name = "new name"
          interaction.command_options.description = "new description"
          interaction.command_options.invocation = "/d20 modifier:8"
        })

        it("creates a new record", async () => {
          await set_command.execute(interaction)

          const unfinished = saved_rolls.detail(record_id)
          expect(unfinished.command).toMatch("d10")
          expect(saved_rolls.count()).toEqual(2)
        })
      })
    })
  })
})
