const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_advantage_select",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.prompt.components.advantages")
    return new StringSelectMenuBuilder()
      .setCustomId("opposed_advantage_select")
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { returnObjects: true }))
      .setMinValues(0)
      .setMaxValues(3)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (interaction.user.id !== participants.get("defender").user_uid) {
      return interaction
        .ensure(
          "whisper",
          t("unauthorized", { participants: [participants.get("defender").mention] }),
          {
            user: interaction.user.id,
            component: "opposed_ready",
            detail: `Failed to whisper about unauthorized usage from ${interaction.user.id}`
          }
        )
    }

    interaction.deferUpdate()

    console.log(interaction.values)
    opposed_db.setParticipantAdvantages(participants.get("defender").id, interaction.values)
  },
}
