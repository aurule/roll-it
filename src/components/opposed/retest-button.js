const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_retest",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.shared.retest.button")
    return new ButtonBuilder()
      .setCustomId("opposed_retest")
      .setLabel(t("text"))
      .setEmoji(t("emoji"))
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (!participants.some(p => interaction.user.id === p.user_uid)) {
      return interaction
        .whisper(t("unauthorized", { participants: [attacker.mention, defender.mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_retest" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    // update winning message to remove controls

    // set retester_id on latest test
    // set state to Cancelling
    // reply with the Cancelling message
  },
}
