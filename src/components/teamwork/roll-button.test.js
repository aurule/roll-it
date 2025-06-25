const { Interaction } = require("../../../testing/interaction")
const { Teamwork } = require("../../db/teamwork")

const roll_button = require("./roll-button")

describe("teamwork roll button", () => {
  describe("data", () => {
    it("creates valid data", () => {
      const result = roll_button.data("en-US")

      expect(result).toBeTruthy()
    })

    it("customId matches component name", () => {
      const result = roll_button.data("en-US")

      expect(result.data.custom_id).toEqual(roll_button.name)
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
      interaction.customId = roll_button.name

      teamwork_db = new Teamwork()
      teamwork_test_id = teamwork_db.addTeamwork({
        command: "nwod",
        options: {
          roller: {
            explode: 10,
            rote: false,
            threshold: 8,
          },
          summer: {
            threshold: 8,
          },
          presenter: {
            explode: 10,
            rote: false,
            threshold: 8,
            description: "",
          },
        },
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

      teamwork_db.setDice(teamwork_test_id, "test_leader", 5)
      teamwork_db.setDice(teamwork_test_id, "helper1", 1)
      teamwork_db.setDice(teamwork_test_id, "helper2", 2)
    })

    it("throws when user is not the test leader", async () => {
      interaction.user.id = "someone else"

      try {
        await roll_button.execute(interaction)
      } catch(e) {
        expect(e.message).toMatch("not allowed")
      }
    })

    describe("with an unknown command", () => {
      beforeEach(() => {
        interaction = new Interaction()
        interaction.user.id = "test_leader"
        interaction.customId = roll_button.name

        teamwork_db = new Teamwork()
        teamwork_test_id = teamwork_db.addTeamwork({
          command: "florp",
          options: {
            roller: {
              explode: 10,
              rote: false,
              threshold: 8,
            },
            summer: {
              threshold: 8,
            },
            presenter: {
              explode: 10,
              rote: false,
              threshold: 8,
              description: "",
            },
          },
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

      it.todo("marks the test as finished")

      it("replies that the test was invalid", async () => {
        await roll_button.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot be rolled")
      })
    })

    it("shows the command's final result", async () => {
      await roll_button.execute(interaction)

      expect(interaction.replyContent).toMatch("rolled **")
    })

    it("shows the helpers embed", async () => {
      await roll_button.execute(interaction)

      expect(interaction.replies[0].embeds).toBeTruthy()
    })
  })
})
