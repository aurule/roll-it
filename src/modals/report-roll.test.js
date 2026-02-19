vitest.mock("../util/message-builders")

import { Feedback } from "../db/feedback.js"
import { ModalInteraction } from "../../testing/modal-interaction.js"

import { ReportRollModal } from "./report-roll.js"

describe("report roll modal", () => {
  describe("submit", () => {
    let interaction

    beforeEach(() => {
      interaction = new ModalInteraction()
    })

    describe("with missing record", () => {
      it("fails silently", async () => {
        const modal = new ReportRollModal(interaction, 5)

        await modal.submit()

        expect(interaction.replyContent).toMatch("Thanks")
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
          const modal = new ReportRollModal(interaction, record_id)

          await modal.submit()

          const detail = feedback.detail(record_id)
          expect(detail.content).toMatch("new note\n")
        })

        it("updates the consent field", async () => {
          interaction.setField("notes", "new note")
          interaction.setField("consent", "CONSENT")
          const modal = new ReportRollModal(interaction, record_id)

          await modal.submit()

          const detail = feedback.detail(record_id)
          expect(detail.canReply).toEqual(true)
        })
      })

      describe("with no notes", () => {
        it("saves that no notes were given", async () => {
          const modal = new ReportRollModal(interaction, record_id)

          await modal.submit()

          const detail = feedback.detail(record_id)
          expect(detail.content).toMatch("no notes")
        })

        it("updates the consent field", async () => {
          interaction.setField("consent", "CONSENT")
          const modal = new ReportRollModal(interaction, record_id)

          await modal.submit()

          const detail = feedback.detail(record_id)
          expect(detail.canReply).toEqual(true)
        })
      })
    })
  })
})
