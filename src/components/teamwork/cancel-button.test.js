import { Interaction } from "../../../testing/interaction.js"
import { Teamwork } from "../../db/teamwork.js"

import cancelButton from "./cancel-button.js"

describe("teamwork cancel button", () => {
  describe("data", () => {
    it("creates valid data", () => {
      const result = cancelButton.data("en-US")

      expect(result).toBeTruthy()
    })

    it("customId matches component name", () => {
      const result = cancelButton.data("en-US")

      expect(result.data.custom_id).toEqual(cancelButton.name)
    })
  })

  describe("execute", () => {
    let interaction
    let teamwork_db

    beforeEach(() => {
      interaction = new Interaction()
      interaction.user.id = "test_leader"
      interaction.customId = cancelButton.name

      teamwork_db = new Teamwork()
      const teamwork_test_id = teamwork_db.addTeamwork({
        command: "nwod",
        options: {},
        leader: "test_leader",
        locale: "en-US",
        channelId: "test_channel",
        timeout: 1000,
      }).lastInsertRowid

      teamwork_db.addMessage({
        message_uid: interaction.message.id,
        teamwork_id: teamwork_test_id,
      })
    })

    it("throws when user is not the test leader", async () => {
      interaction.user.id = "someone else"

      try {
        await cancelButton.execute(interaction)
      } catch (e) {
        expect(e.message).toMatch("not allowed")
      }
    })

    it.todo("marks teamwork test as cancelled")

    it("sends cancellation message", async () => {
      await cancelButton.execute(interaction)

      expect(interaction.replyContent).toMatch("cancelled their teamwork test")
    })
  })
})
