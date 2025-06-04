const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_retest_select",
  data: (challenge) => {
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.shared.retest.picker")
    return new StringSelectMenuBuilder()
      .setCustomId("opposed_retest_select")
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { ability: challenge.retest_ability, returnObjects: true }))
      .setMinValues(1)
      .setMaxValues(1)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (!participants.some(p => interaction.user.id === p.user_uid)) {
      return interaction
        .whisper(t("unauthorized", { participants: [participants.get("attacker").mention, participants.get("defender").mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_retest_select" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    interaction.deferUpdate()

    // update latest test with new retest_reason
  },
}
