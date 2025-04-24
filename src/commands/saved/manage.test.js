const { UserSavedRolls } = require("../../db/saved_rolls")
const { CommandInteraction } = require("../../../testing/command-interaction")
const saved_manage_command = require("./manage")

describe("/saved manage", () => {
  describe("execute", () => {
    let interaction
    let saved_rolls
    let prompt

    beforeEach(() => {
      interaction = new CommandInteraction({ commandName: "saved" })
      interaction.setOption("name", "test")
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
      prompt = interaction.message
    })

    it("warns on missing saved roll", async () => {
      interaction.setOption("name", "sir not appearing in this database")

      await saved_manage_command.execute(interaction)

      expect(prompt.content).toMatch("does not exist")
    })

    it("shows roll info", async () => {
      await saved_manage_command.execute(interaction)
      await prompt.componentEvents.timeout()

      expect(interaction.replyContent).toMatch("test")
      expect(interaction.replyContent).toMatch("*pool:* 1")
    })

    it("prompts the user with actions", async () => {
      await saved_manage_command.execute(interaction)

      expect(prompt.components).toBeTruthy()
      await prompt.componentEvents.timeout()
    })

    describe("cancel button", () => {
      it("deletes the message", async () => {
        await saved_manage_command.execute(interaction)

        await prompt.click("cancel")

        expect(interaction.message.deleted).toEqual(true)
      })
    })

    describe("edit button", () => {
      it("shows a modal", async () => {
        await saved_manage_command.execute(interaction)

        const sent = await prompt.click("edit")

        expect(sent).toBeTruthy()
      })
    })

    describe("remove button", () => {
      it("shows a chicken switch", async () => {
        await saved_manage_command.execute(interaction)

        await prompt.click("remove")

        expect(prompt.content).toMatch("Are you sure")
      })

      describe("user cancels removal", () => {
        it("shows an acknowledgement", async () => {
          await saved_manage_command.execute(interaction)
          await prompt.click("remove")

          await prompt.click("remove_cancel")

          expect(prompt.content).toMatch("Cancelled")
        })

        it("does not change the db", async () => {
          await saved_manage_command.execute(interaction)
          await prompt.click("remove")

          await prompt.click("remove_cancel")

          expect(saved_rolls.taken("test")).toEqual(true)
        })
      })

      describe("user confirms removal", () => {
        it("shows acknowledgement", async () => {
          await saved_manage_command.execute(interaction)
          await prompt.click("remove")

          await prompt.click("remove_confirm")

          expect(prompt.content).toMatch("been removed")
        })

        it("deletes the roll", async () => {
          await saved_manage_command.execute(interaction)
          await prompt.click("remove")

          await prompt.click("remove_confirm")

          expect(saved_rolls.taken("test")).toEqual(false)
        })
      })
    })
  })
})
