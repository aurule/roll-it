vitest.mock("../../util/message-builders")

import { Interaction } from "../../../testing/interaction.js"
import { Installation } from "../../db/installation.js"

import { data, execute } from "./cancel-button.js"

describe("installation cancel button", () => {
  describe("data", () => {
    it("has the cancel label", () => {
      const result = data("en-US")

      expect(result.data.label).toMatch("Cancel")
    })
  })

  describe("execute", () => {
    let install_db
    let install_id
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
      install_db = new Installation()
      install_id = install_db.addInstallation({
        locale: "en-US",
        guild_uid: interaction.guild.id,
        user_uid: interaction.user.id,
        old_deets: {},
      }).lastInsertRowid
      install_db.addMessage({
        message_uid: interaction.message.id,
        installation_id: install_id,
      })
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

    it("marks the installation finished", async () => {
      await execute(interaction)

      const record = install_db.getInstallation(install_id)
      expect(record.finished).toBe(true)
    })

    it("sends the cancellation message", async () => {
      await execute(interaction)

      expect(interaction.replyContent).toMatch("Cancelled")
    })
  })
})
