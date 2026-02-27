import { TextInputBuilder, TextInputStyle } from "discord.js"

import { logger } from "../util/logging/setup.js"
import { i18n } from "../locales/index.js"
import { Feedback } from "../db/feedback.js"
import { sendError } from "../services/metrics.js"
import { Modal } from "./modal.js"
import * as build from "../util/modal-builders.js"

/**
 * Modal for adding feedback details after reporting a roll
 */
export class ReportRollModal extends Modal {
  static name = "report-roll"
  t
  db

  /**
   * Create the modal's data structure
   * @param  {number}       feedback_id Internal ID of the associated feedback record
   * @param  {string}       locale      Locale code
   * @return {ModalBuilder}             Modal data object
   */
  static data(feedback_id, locale) {
    const t = i18n.getFixedT(locale, "modals", `report-roll`)

    const notes_input = new TextInputBuilder()
      .setCustomId("notes")
      .setPlaceholder(t("inputs.notes.placeholder"))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(4000)


    const consent_length = t("inputs.consent.keyword").length
    const consent_input = new TextInputBuilder()
      .setCustomId("consent")
      .setPlaceholder(t("inputs.consent.placeholder"))
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setMinLength(consent_length)
      .setMaxLength(consent_length)

    const components = [
      build.label(notes_input, t("inputs.notes.label")),
      build.label(consent_input, t("inputs.consent.label")),
    ]

    return build.modal(`${ReportRollModal.name}_${feedback_id}`, t("title"), components)
  }

  constructor(modal_interaction, feedback_id) {
    super(modal_interaction, feedback_id)
    this.t = i18n.getFixedT(this.interaction.locale, "modals", `report-roll`)
    this.db = new Feedback()
  }

  /**
   * Submit the modal
   */
  async submit() {
    const notes = this.getTextInputValue("notes", "no notes given")
    const canReply = this.getTextInputValue("consent") === this.t("inputs.consent.keyword")

    const data = {
      canReply,
      notes,
      userId: this.interaction.user.id,
      id: this.id,
    }

    try {
      this.db.addNotes(data)
    } catch (err) {
      sendError(err, {
        user: this.interaction.user,
        guild: this.interaction.guildId,
        inputs: this.fields,
      })
      logger.error(
        {
          err,
          user: this.interaction.user,
          guild: this.interaction.guildId,
          inputs: this.fields,
        },
        "Could not update feedback record",
      )
      return this.whisper(this.t("response.error"))
    }

    return this.whisper(this.t("response.success"))
  }
}
