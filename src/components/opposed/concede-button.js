const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_concede",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.winning.concede")
    return new ButtonBuilder()
      .setCustomId("opposed_concede")
      .setLabel(t("text"))
      .setEmoji(t("emoji"))
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    // const participants = opposed_db.getParticipants(challenge.id)
    // const attacker = participants.get("attacker")
    // const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (interaction.user.id !== test.trailer.id) {
      return interaction
        .whisper(t("unauthorized", { participants: [test.trailer.mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_concede" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    // update winning message to remove controls

    const { cleanup } = require("../../interactive/opposed")
    cleanup(challenge.id)

    const t_args = {
      leader: test.leader.mention,
      trailer: test.trailer.mention,
      summary: challenge.summary,
    }

    return interaction
      .reply({
        content: t("conceded", t_args),
      })
      .catch((error) =>
        logger.warn(
          { err: error, user: interaction.user.id, component: "opposed_concede" },
          `Could not reply with concession message`,
        ),
      )
  },
}
