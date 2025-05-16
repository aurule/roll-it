const { ButtonBuilder, ButtonStyle, TextDisplayBuilder } = require("discord.js")
const { editMessage } = require("../../services/api")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/interactive")
const { logger } = require("../../util/logger")
const throw_message = require("../../messages/opposed/throw")

module.exports = {
  name: "opposed_ready",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_ready")
      .setLabel(i18n.t("opposed.prompt.components.ready", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Success),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const { attacker, defender } = opposed_db.getParticipants(challenge.id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (false) {
    // if (interaction.user.id !== defender.id) {
      return interaction
        .whisper(t("unauthorized", { participant: defender.mention }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_ready" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    const test_id = opposed_db.addTest({ challenge_id: challenge.id }).lastInsertRowid

    const prompt_uid = opposed_db.getPromptUid(challenge.id)
    const t_args = {
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
      attacker: attacker.mention,
      attacker_advantages: attacker.advantages.map(a => t(`shared.advantages.${a}`)),
      defender: defender.mention,
      defender_advantages: attacker.advantages.map(a => t(`shared.advantages.${a}`)),
      conditions: challenge.conditions.map(c => t(`shared.conditions.${c}`)),
      attribute: challenge.attribute,
      retest: challenge.retest_ability,
    }
    await editMessage(challenge.channel_uid, prompt_uid, {
      components: [
        new TextDisplayBuilder({
          content: t("summary.challenge", t_args),
        })
      ],
      allowedMentions: { parse: [] },
    })
      .catch((error) =>
        logger.error(
          {
            err: error,
            challenge,
            channel: interaction.channelId,
          },
          "Could not edit initial opposed prompt",
        ),
      )

    return interaction
      .reply(throw_message.data({ challenge, attacker, defender }))
      .then((reply_interaction) => {
        opposed_db.addMessage({
          challenge_id: challenge.id,
          test_id,
          message_uid: reply_interaction.resource.message.id,
        })
      })
      .catch((error) =>
        logger.error(
          {
            err: error,
            challenge,
            channel: interaction.channelId,
          },
          "Could not reply with first test prompt",
        ),
      )
  },
}
