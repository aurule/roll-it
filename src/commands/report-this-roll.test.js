jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")

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

    it("warns on bad author ID", async () => {
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
