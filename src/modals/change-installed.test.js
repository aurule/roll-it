vitest.mock("../util/message-builders")

import { ModalInteraction } from "../../testing/modal-interaction.js"
import { Installation } from "../db/installation.js"
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

  describe("setMatch", () => {
    it("true if both sets have identical elements", () => {
      const set1 = new Set(["a", "b", "c"])
      const set2 = new Set(["a", "b", "c"])

      const result = changeInstalled.setMatch(set1, set2)

      expect(result).toBe(true)
    })

    it("false if one set has more elements", () => {
      const set1 = new Set(["a", "b", "c", "d"])
      const set2 = new Set(["a", "b", "c"])

      const result = changeInstalled.setMatch(set1, set2)

      expect(result).toBe(false)
    })

    it("false if one set has different elements, but is the same length", () => {
      const set1 = new Set(["a", "b", "c"])
      const set2 = new Set(["a", "b", "d"])

      const result = changeInstalled.setMatch(set1, set2)

      expect(result).toBe(false)
    })

    it("true for empty sets", () => {
      const set1 = new Set()
      const set2 = new Set()

      const result = changeInstalled.setMatch(set1, set2)

      expect(result).toBe(true)
    })
  })
})
