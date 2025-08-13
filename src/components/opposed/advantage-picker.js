const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { valuesOrDefault } = require("../../util/values-or-default")

/**
 * Select control for selecting a participant's advantages
 */
module.exports = {
  name: "opposed_advantage_select",
  data: (locale, participant) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.shared.advantages-picker")
    return new StringSelectMenuBuilder()
      .setCustomId(`opposed_advantage_select_${participant.id}`)
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { returnObjects: true }))
      .setMinValues(0)
      .setMaxValues(3)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const participant_id = parseInt(interaction.customId.match(/_(\d+)/)[1])
    const allowed_participant = opposed_db.getParticipant(participant_id)

    interaction.authorize(allowed_participant.user_uid)

    interaction.deferUpdate()

    const values = valuesOrDefault(interaction, ["none"])

    opposed_db.setParticipantAdvantages(allowed_participant.id, values)
  },
}
