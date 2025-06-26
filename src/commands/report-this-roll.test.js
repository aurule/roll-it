const { Interaction } = require("../../testing/interaction")
const interactionCache = require("../services/interaction-cache")

const report_roll_command = require("./report-this-roll")

require("dotenv").config({ quiet: true })
const botId = process.env.CLIENT_ID

describe("Report this roll", () => {
  describe("execute", () => {
    let interaction
    let past_interaction
    let saved_rolls
    beforeEach(() => {
      interaction = new Interaction()
      past_interaction = new Interaction(interaction.guildId)
      interaction.targetMessage = {
        guildId: interaction.guildId,
        interactionMetadata: {
          id: past_interaction.id,
        },
        author: { id: botId },
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
