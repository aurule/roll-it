const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/interactive")
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
    const { attacker, defender } = opposed_db.getParticipants(challenge.id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (interaction.user.id !== defender.id) {
      return interaction
        .whisper(t("unauthorized", { participants: [attacker.mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_advantage_select" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    interaction.deferUpdate()

    opposed_db.updateParticipant(defender.id, interaction.values)
  },
}
