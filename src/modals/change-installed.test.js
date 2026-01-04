jest.mock("../util/message-builders")

const { ModalInteraction } = require("../../testing/modal-interaction")
const { Installation } = require("../db/installation")
const changeInstalled = require("./change-installed")

describe("change installed modal", () => {
  describe("submit", () => {
    let interaction
    let installation_id
    let db

    beforeEach(() => {
      interaction = new ModalInteraction()
      db = new Installation()
    })

    describe("with different choices", () => {
      beforeEach(() => {
        installation_id = db.addInstallation({
          locale: "en-US",
          guild_uid: "guild",
          user_uid: "user",
          old_deets: {
            commands: ["drh"],
            systems: ["drh"],
            features: [],
          },
        }).lastInsertRowid
      })

      it("updates record with new details", async () => {
        interaction.setFields({
          systems: ["drh", "nwod"],
          features: [],
        })

        await changeInstalled.submit(interaction, installation_id)

        const record = db.getInstallation(installation_id)
        expect(record.new_deets.systems).toContain("drh")
        expect(record.new_deets.systems).toContain("nwod")
      })

      it("shows the changes message", async () => {
        interaction.setFields({
          systems: ["drh", "nwod"],
          features: [],
        })

        await changeInstalled.submit(interaction, installation_id)

        expect(interaction.replyContent).toMatch("the changes")
      })
    })

    describe("with matching choices", () => {
      beforeEach(() => {
        installation_id = db.addInstallation({
          locale: "en-US",
          guild_uid: "guild",
          user_uid: "user",
          old_deets: {
            commands: ["drh"],
            systems: ["drh"],
            features: [],
          },
        }).lastInsertRowid

        interaction.setFields({
          systems: ["drh"],
          features: [],
        })
      })

      it("acknowledges the interaction", async () => {
        await changeInstalled.submit(interaction, installation_id)

        expect(interaction.deferred).toBe(true)
      })
    })
  })
})
