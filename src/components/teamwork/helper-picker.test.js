const { Interaction } = require("../../../testing/interaction")
const { Teamwork } = require("../../db/teamwork")

const helper_picker = require("./helper-picker")

describe("teamwork helper picker", () => {
  describe("data", () => {
    it("creates valid data", () => {
      const result = helper_picker.data("en-US")

      expect(result).toBeTruthy()
    })

    it("customId matches component name", () => {
      const result = helper_picker.data("en-US")

      expect(result.data.custom_id).toEqual(helper_picker.name)
    })
  })

  describe("execute", () => {
    let interaction
    let teamwork_db
    let teamwork_test
    let teamwork_test_id

    beforeEach(() => {
      interaction = new Interaction()
      interaction.user.id = "test_leader"
      interaction.customId = helper_picker.name

      teamwork_db = new Teamwork()
      teamwork_test_id = teamwork_db.addTeamwork({
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
        await helper_picker.execute(interaction)
      } catch(e) {
        expect(e.message).toMatch("not allowed")
      }
    })

    it("replies with an info message when values have not changed", async () => {
      interaction.values = []

      await helper_picker.execute(interaction)

      expect(interaction.replyContent).toMatch("did not change")
    })

    it("forces bot contribution to zero", async () => {
      interaction.values = [process.env.CLIENT_ID]

      await helper_picker.execute(interaction)

      const bot_helper = teamwork_db.getHelperDetails(teamwork_test_id, process.env.CLIENT_ID)
      expect(bot_helper.dice).toEqual(0)
    })

    it("sets the helpers on the teamwork test", async () => {
      interaction.values = ["helper1", "helper2"]

      await helper_picker.execute(interaction)

      const helpers = teamwork_db.getRequestedHelpers(teamwork_test_id)
      const helper_uids = helpers.map(h => h.user_uid)
      expect(helper_uids).toContain("helper1")
    })

    it("replies with info about added helpers", async () => {
      interaction.values = ["helper1", "helper2"]

      await helper_picker.execute(interaction)

      expect(interaction.replyContent).toMatch("requested help from")
    })

    it("replies with info about removed helpers when total list is smaller", async () => {
      teamwork_db.setRequestedHelpers(teamwork_test_id, ["helper1", "helper2"])
      interaction.values = ["helper2"]

      await helper_picker.execute(interaction)

      expect(interaction.replyContent).toMatch("has requested help.")
    })
  })
})
