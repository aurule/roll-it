const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

const { logger } = require("../util/logger")
const { i18n } = require("../locales")
const { Feedback } = require("../db/feedback")

/**
 * Modal for adding feedback details after reporting a roll
 *
 * @type {Object}
 */
module.exports = {
  name: "report-roll",
  data(id, locale) {
    const t = i18n.getFixedT(locale, "modals", `report-roll`)

    const modal = new ModalBuilder()
      .setCustomId(`${module.exports.name}_${id}`)
      .setTitle(t("title"))

    const notes_input = new TextInputBuilder()
      .setCustomId("notes")
      .setLabel(t("inputs.notes.label"))
      .setPlaceholder(t("inputs.notes.placeholder"))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(4000)
    const notes_row = new ActionRowBuilder().addComponents(notes_input)

    const consent_length = t("inputs.consent.keyword").length
    const consent_input = new TextInputBuilder()
      .setCustomId("consent")
      .setLabel(t("inputs.consent.label"))
      .setPlaceholder(t("inputs.consent.placeholder"))
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setMinLength(consent_length)
      .setMaxLength(consent_length)
    const consent_row = new ActionRowBuilder().addComponents(consent_input)

    modal.addComponents(notes_row, consent_row)

    return modal
  },
  async submit(modal_interaction, feedback_id) {
    const t = i18n.getFixedT(modal_interaction.locale, "modals", `report-roll`)

    const notes = modal_interaction.fields.getTextInputValue("notes") ?? "no notes given"

    const data = {
      canReply:
        modal_interaction.fields.getTextInputValue("consent") === t("inputs.consent.keyword"),
      notes,
      userId: modal_interaction.user.id,
      id: feedback_id,
    }

    const feedback = new Feedback()
    try {
      feedback.addNotes(data)
    } catch (err) {
      logger.error(
        {
          err,
          user: modal_interaction.user,
          guild: modal_interaction.guildId,
          inputs: modal_interaction.fields.fields,
        },
        "Could not update feedback record",
      )
      return modal_interaction.whisper(t("response.error"))
    }

    return modal_interaction.whisper(t("response.success"))
  },
}
