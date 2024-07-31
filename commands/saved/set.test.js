const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../testing/interaction")

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
        interaction.command_options.invocation = "/chop"

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
          modifier: 3
        })
      })

      it("responds with instructions to use the saved roll", async () => {
        await set_command.execute(interaction)

        expect(interaction.replyContent).toMatch("Try it out")
      })
    })
  })

  describe("with an incomplete roll", () => {
    describe("with name and description", () => {
      describe("with no invocation", () => {
        it.todo("overwrites the name")
        it.todo("overwrites the description")
        it.todo("leaves the roll incomplete")
        it.todo("responds with instructions to finish the saved roll")
      })

      describe("with an invocation", () => {
        it.todo("overwrites the name")
        it.todo("overwrites the description")
        it.todo("saves the command")
        it.todo("saves the options")
        it.todo("marks roll as complete")
        it.todo("responds with instructions to use the saved roll")
      })
    })

    describe("with command and options", () => {
      describe("with no invocation", () => {
        it.todo("saves the name")
        it.todo("saves the description")
        it.todo("marks roll as complete")
        it.todo("responds with instructions to use the saved roll")
      })

      describe("with an invocation", () => {
        it.todo("saves the name")
        it.todo("saves the description")
        it.todo("overwrites the command")
        it.todo("overwrites the options")
        it.todo("marks roll as complete")
        it.todo("responds with instructions to use the saved roll")
      })
    })
  })
})
