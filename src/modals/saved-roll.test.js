const rollCache = require("../services/roll-cache")
const { ModalInteraction } = require("../../testing/modal-interaction")
const { UserSavedRolls } = require("../db/saved_rolls")

const SavedRollModal = require("./saved-roll")

describe("saved roll modal", () => {
  describe("data", () => {
    it("throws on unknown mode", () => {
      expect(() => SavedRollModal.data("nope", "en-US")).toThrow("Unrecognized mode")
    })

    it.each([
      ["create", "New Roll"],
      ["edit", "Edit a"],
      ["replace", "New Name"],
    ])("shows %s mode title", (mode, title) => {
      const modal = SavedRollModal.data(mode, "en-US")

      expect(modal.data.title).toMatch(title)
    })

    it("presets name value if given", () => {
      const modal = SavedRollModal.data("create", "en-US", { name: "test" })

      expect(modal.components[0].components[0].data.value).toEqual("test")
    })

    it("presets description value if given", () => {
      const modal = SavedRollModal.data("create", "en-US", { description: "test" })

      expect(modal.components[1].components[0].data.value).toEqual("test")
    })
  })

  describe("submit", () => {
    let interaction
    let response

    beforeEach(() => {
      interaction = new ModalInteraction()
      response = interaction.message
    })

    it("shows error on cache miss", async () => {
      await SavedRollModal.submit(interaction)

      expect(response.content).toMatch("nothing to change")
    })

    it("shows error on missing name", async () => {
      await rollCache.set(interaction, { description: "description" })

      await SavedRollModal.submit(interaction)

      expect(response.content).toMatch("give both a name")
    })

    it("shows error on missing description", async () => {
      await rollCache.set(interaction, { name: "name" })

      await SavedRollModal.submit(interaction)

      expect(response.content).toMatch("give both a name")
    })

    describe("with no errors", () => {
      let user_rolls

      beforeEach(async () => {
        user_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
        await rollCache.set(interaction, { command: "roll" })
        interaction.setFields({
          name: "clean",
          description: "test roll",
        })
      })

      it("saves the new roll", async () => {
        await SavedRollModal.submit(interaction)

        expect(user_rolls.count()).toEqual(1)
      })

      it("shows a success message", async () => {
        await SavedRollModal.submit(interaction)

        expect(response.content).toMatch("roll is saved")
      })

      it("shows an invocation example", async () => {
        await SavedRollModal.submit(interaction)

        expect(response.content).toMatch("/saved roll name:clean")
      })
    })

    describe("with an unknown error", () => {
      beforeEach(async () => {
        await rollCache.set(interaction, { mangle: true, command: "roll" })
        interaction.setFields({
          name: "asplode",
          description: "test roll",
        })
      })

      it("shows an error message", async () => {
        await SavedRollModal.submit(interaction)

        expect(response.content).toMatch("Something went wrong")
      })
    })

    describe("with a name collision", () => {
      beforeEach(async () => {
        user_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
        user_rolls.create({
          name: "collide",
          description: "already taken",
          command: "roll",
        })

        await rollCache.set(interaction, { command: "roll" })
        interaction.setFields({
          name: "collide",
          description: "new data",
        })
      })

      it("prompts the user for action", async () => {
        await SavedRollModal.submit(interaction)

        expect(response.content).toMatch("What do you want to do?")
      })

      describe("on cancel", () => {
        it("shows a cancel message", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("abort")

          expect(response.content).toMatch("Cancelled")
        })

        it("clears the cache", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("abort")

          const stored = await rollCache.get(interaction)
          expect(stored).toBeUndefined()
        })
      })

      describe("on try again", () => {
        it("shows an edit message", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("retry")

          expect(response.content).toMatch("try that again")
        })

        it("leaves cache alone", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("retry")

          const stored = await rollCache.get(interaction)
          expect(stored).not.toBeUndefined()
        })
      })

      describe("on overwrite", () => {
        it("replaces the old roll", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("overwrite")

          const detail = user_rolls.detail(undefined, "collide")
          expect(detail.description).toMatch("new data")
        })

        it("clears the cache", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("overwrite")

          const stored = await rollCache.get(interaction)
          expect(stored).toBeUndefined()
        })

        it("shows a success message", async () => {
          await SavedRollModal.submit(interaction)

          await response.click("overwrite")

          expect(response.content).toMatch("Replaced the roll")
        })
      })

      describe("on timeout", () => {
        it("shows the timeout message", async () => {
          await SavedRollModal.submit(interaction)

          await response.timeout()

          expect(response.content).toMatch("Ran out of time.")
        })

        it("clears the cache", async () => {
          await SavedRollModal.submit(interaction)

          await response.timeout()

          const stored = await rollCache.get(interaction)
          expect(stored).toBeUndefined()
        })
      })
    })
  })
})
