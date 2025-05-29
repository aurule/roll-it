const { ButtonBuilder, ButtonStyle, TextDisplayBuilder } = require("discord.js")
const { editMessage } = require("../../services/api")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
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
    const participants = opposed_db.getParticipants(challenge.id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (false) {
    // if (interaction.user.id !== defender.id) {
      return interaction
        .whisper(t("unauthorized", { participants: [attacker.mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "opposed_ready" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    // set ties on the challenge
    // if throws eq
    //   if both ties are eq, tied
    //   else if attacker has ties, attacker
    //   else defender

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
