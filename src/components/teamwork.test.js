jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")
const { Teamwork } = require("../db/teamwork")
const cancel_button = require("./teamwork/cancel-button")
const { UnauthorizedError } = require("../errors/unauthorized-error")

const teamwork = require("./teamwork")

describe("teamwork component handler", () => {
  describe("canHandle", () => {
    it("returns true when customId matches a teamwork component", () => {
      const result = teamwork.canHandle({ customId: "teamwork_cancel" })

      expect(result).toBe(true)
    })

    it("returns false when customId does not match a teamwork component", () => {
      const result = teamwork.canHandle({ customId: "nope" })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with no teamwork test", () => {
      it("replies that the test is concluded", async () => {
        teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with expired test", () => {
      let teamwork_db
      let teamwork_test_id

      beforeEach(() => {
        interaction.customId = "teamwork_cancel"

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
          leader: interaction.user.id,
          locale: "en-US",
          channelId: "test_channel",
          timeout: -250,
        }).lastInsertRowid

        teamwork_db.addMessage({
          message_uid: interaction.message.id,
          teamwork_id: teamwork_test_id,
        })
      })

      it.todo("marks the test as done")

      it("replies that the test is concluded", async () => {
        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a valid teamwork test", () => {
      let teamwork_db
      let teamwork_test_id
      let execute_spy

      beforeEach(() => {
        interaction.customId = "teamwork_cancel"

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
          leader: interaction.user.id,
          locale: "en-US",
          channelId: "test_channel",
          timeout: 1000,
        }).lastInsertRowid

        teamwork_db.addMessage({
          message_uid: interaction.message.id,
          teamwork_id: teamwork_test_id,
        })

        execute_spy = jest.spyOn(cancel_button, "execute")
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(() => true)

        await teamwork.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error message when user is unauthorized", async () => {
        execute_spy.mockImplementation(() => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
