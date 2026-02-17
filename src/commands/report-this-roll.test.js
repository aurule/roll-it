vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"
import { User } from "../../testing/user.js"
import { UserBans } from "../db/bans.js"
import { Feedback } from "../db/feedback.js"

import { ReportThisRoll } from "./report-this-roll.js"

describe("Report this roll command", () => {
  describe("execute", () => {
    let interaction
    let past_interaction

    beforeEach(() => {
      interaction = new Interaction()
      past_interaction = new Interaction(interaction.guildId)
      interaction.targetMessage = {
        guildId: interaction.guildId,
        interactionMetadata: {
          id: past_interaction.id,
        },
        author: { id: process.env.CLIENT_ID },
      }
    })

    describe("with a banned user", () => {
      let banned_user

      beforeEach(() => {
        banned_user = new User()
        const bans = new UserBans(banned_user.id)
        bans.create("testing")
        interaction.user = banned_user
      })

      it("does not add feedback", async () => {
        const report_roll_command = new ReportThisRoll(interaction)

        await report_roll_command.execute()

        const feedbacks = new Feedback()
        expect(feedbacks.count()).toEqual(0)
      })

      it("says the user is banned", async () => {
        const report_roll_command = new ReportThisRoll(interaction)

        await report_roll_command.execute()

        expect(interaction.replyContent).toMatch("not allowed")
      })
    })

    it("shows error on bad author ID", async () => {
      interaction.targetMessage.author.id = "wasnt_me"
      const report_roll_command = new ReportThisRoll(interaction)

      await report_roll_command.execute()

      expect(interaction.replyContent).toMatch("not sent by a Roll It command")
    })

    it("shows a modal", async () => {
      const report_roll_command = new ReportThisRoll(interaction)

      const sent = await report_roll_command.execute()

      expect(sent).toBeTruthy()
    })
  })
})
