vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"
import { Teamwork } from "../db/teamwork.js"
import cancelButton from "./teamwork/cancel-button.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"

import teamwork_handler from "./teamwork.js"

describe("teamwork component handler", () => {
  describe("handle", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with no teamwork test", () => {
      it("replies that the test is concluded", async () => {
        teamwork_handler.handle(interaction)

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
        await teamwork_handler.handle(interaction)

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

        execute_spy = vitest.spyOn(cancelButton, "execute")
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(async () => true)

        await teamwork_handler.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error message when user is unauthorized", async () => {
        execute_spy.mockImplementation(async () => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await teamwork_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
