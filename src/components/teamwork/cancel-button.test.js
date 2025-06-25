const { Interaction } = require("../../../testing/interaction")
const { Teamwork } = require("../../db/teamwork")

const cancel_button = require("./cancel-button")

describe("teamwork cancel button", () => {
  describe("data", () => {
    it("creates valid data", () => {
      const result = cancel_button.data("en-US")

      expect(result).toBeTruthy()
    })

    it("customId matches component name", () => {
      const result = cancel_button.data("en-US")

      expect(result.data.custom_id).toEqual(cancel_button.name)
    })
  })

  describe("execute", () => {
    let interaction
    let teamwork_db
    let teamwork_test

    beforeEach(() => {
      interaction = new Interaction()
      interaction.user.id = "test_leader"
      interaction.customId = cancel_button.name

      teamwork_db = new Teamwork()
      const teamwork_test_id = teamwork_db.addTeamwork({
        command: "nwod",
        options: {},
        leader: "test_leader",
        locale: "en-US",
        channelId: "test_channel",
        timeout: 1000,
      }).lastInsertRowid

      teamwork_test = teamwork_db.detail(teamwork_test_id)

      teamwork_db.addMessage({
        message_uid: interaction.message.id,
        teamwork_id: teamwork_test_id,
      })
    })

    it("throws when user is not the test leader", async () => {
      interaction.user.id = "someone else"

      try {
        await cancel_button.execute(interaction)
      } catch(e) {
        expect(e.message).toMatch("not allowed")
      }
    })

    it.todo("marks teamwork test as cancelled")

    it("sends cancellation message", async () => {
      await cancel_button.execute(interaction)

      expect(interaction.replyContent).toMatch("cancelled their teamwork test")
    })
  })
})
