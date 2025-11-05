jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")
const { User } = require("../../testing/user")
const { UserBans } = require("../db/bans")
const { Feedback } = require("../db/feedback")

const report_roll_command = require("./report-this-roll")

describe("Report this roll command", () => {
  beforeAll(() => {
    require("dotenv").config({ quiet: true })
  })

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

      it("does not add feedback", () => {
        report_roll_command.execute(interaction)

        const feedbacks = new Feedback()
        expect(feedbacks.count()).toEqual(0)
      })

      it("says the user is banned", () => {
        report_roll_command.execute(interaction)

        expect(interaction.replyContent).toMatch("not allowed")
      })
    })

    it("shows error on bad author ID", async () => {
      interaction.targetMessage.author.id = "wasnt_me"

      await report_roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("not sent by a Roll It command")
    })

    it("shows a modal", async () => {
      const sent = await report_roll_command.execute(interaction)

      expect(sent).toBeTruthy()
    })
  })
})
