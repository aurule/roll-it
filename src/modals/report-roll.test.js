const { Feedback } = require("../db/feedback")
const { ModalInteraction } = require("../../testing/modal-interaction")

const ReportRollModal = require("./report-roll")

describe("report roll modal", () => {
  describe("data", () => {
    it("has a notes field", () => {
      const modal = ReportRollModal.data(1, "en-US")

      expect(modal.components[0].components[0].data.custom_id).toMatch("notes")
    })

    it("has a consent field", () => {
      const modal = ReportRollModal.data(1, "en-US")

      expect(modal.components[1].components[0].data.custom_id).toMatch("consent")
    })
  })

  describe("submit", () => {
    let interaction
    let response

    beforeEach(() => {
      interaction = new ModalInteraction()
      response = interaction.message
    })

    describe("with missing record", () => {
      it("fails silently", async () => {
        await ReportRollModal.submit(interaction, 5)

        expect(response.content).toMatch("Thanks")
      })
    })

    describe("with existing record", () => {
      let record_id
      let feedback

      beforeEach(() => {
        feedback = new Feedback()

        const result = feedback.create({
          userId: interaction.user.id,
          guildId: interaction.guildId,
          content: "test content",
          commandName: "roll",
          canReply: false,
          locale: "en-US",
        })
        record_id = result.lastInsertRowid
      })

      describe("with notes", () => {
        it("prepends the notes to the existing record", async () => {
          interaction.setField("notes", "new note")

          await ReportRollModal.submit(interaction, record_id)
        })

        it("updates the consent field", async () => {
          interaction.setField("notes", "new note")
          interaction.setField("consent", "CONSENT")

          await ReportRollModal.submit(interaction, record_id)

          const detail = feedback.detail(record_id)
          expect(detail.canReply).toEqual(true)
        })
      })

      describe("with no notes", () => {
        it("saves that no notes were given", async () => {
          await ReportRollModal.submit(interaction, record_id)

          const detail = feedback.detail(record_id)
          expect(detail.content).toMatch("no notes")
        })

        it("updates the consent field", async () => {
          interaction.setField("consent", "CONSENT")

          await ReportRollModal.submit(interaction, record_id)

          const detail = feedback.detail(record_id)
          expect(detail.canReply).toEqual(true)
        })
      })
    })
  })
})
