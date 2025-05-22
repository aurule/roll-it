const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/interactive")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_relent",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_relent")
      .setLabel(i18n.t("opposed.prompt.components.relent", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Secondary),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (interaction.user.id !== defender.id) {
      return interaction
        .whisper(t("unauthorized", { participants: [attacker.mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_relent" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    const { cleanup } = require("../../interactive/opposed")
    cleanup(challenge.id)

    const t_args = {
      attacker: attacker.mention,
      defender: defender.mention,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }

    return interaction
      .reply({
        content: t("relented", t_args),
      })
      .catch((error) =>
        logger.warn(
          { err: error, user: interaction.user.id, component: "opposed_relent" },
          `Could not whisper about cancellation`,
        ),
      )
  },
}
