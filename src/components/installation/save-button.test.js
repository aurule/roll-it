vitest.mock("../../services/api")

import { Interaction } from "../../../testing/interaction.js"
import { Installation } from "../../db/installation.js"

import { data, execute } from "./save-button"

describe("installation save button", () => {
  describe("data", () => {
    it("has Install label", () => {
      const result = data("en-US")

      expect(result.data.label).toMatch("Install")
    })
  })

  describe("execute", () => {
    let install_db

    beforeEach(() => {
      install_db = new Installation()
    })

    it("rejects unrelated users", async () => {
      const interaction = new Interaction()
      const other_install_id = install_db.addInstallation({
        locale: "en-US",
        guild_uid: interaction.guild.id,
        user_uid: "nah",
        old_deets: {},
      }).lastInsertRowid
      install_db.addMessage({
        message_uid: interaction.message.id,
        installation_id: other_install_id,
      })

      await expect(execute(interaction)).rejects.toThrow("not allowed")
    })
  })
})
