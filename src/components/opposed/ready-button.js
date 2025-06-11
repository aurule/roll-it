const { ButtonBuilder, ButtonStyle, TextDisplayBuilder } = require("discord.js")
const { editMessage } = require("../../services/api")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const throw_message = require("../../messages/opposed/throw")

function tieWinnerId(attacker, defender) {
  const attacker_ties = attacker.advantages.includes("ties")
  const defender_ties = defender.advantages.includes("ties")
  if (attacker_ties) {
    if (!defender_ties) {
      return attacker.id
    }
  } else if (defender_ties) {
      return defender.id
  }
  return null
}

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

    interaction.authorize(defender.user_uid)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")


    const summary_args = {
      attacker: attacker.mention,
      attacker_advantages: attacker.advantages.map(a => t(`shared.advantages.${a}`)),
      defender: defender.mention,
      defender_advantages: defender.advantages.map(a => t(`shared.advantages.${a}`)),
      attribute: challenge.attribute,
      conditions: challenge.conditions.map(c => t(`shared.conditions.${c}`)),
      retest: challenge.retest_ability,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }
    const challenge_summary = t("shared.summary", summary_args)
    opposed_db.setChallengeSummary(challenge.id, challenge_summary)

    opposed_db.setTieWinner(tieWinnerId(attacker, defender))
    opposed_db.setChallengeState(challenge.id, ChallengeStates.Throwing)

    const test_id = opposed_db.addTest({ challenge_id: challenge.id, locale: challenge.locale }).lastInsertRowid

    await editMessage(challenge.channel_uid, interaction.message.id, {
      components: [
        new TextDisplayBuilder({ content: challenge_summary })
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
      .ensure(
        "reply",
        throw_message.data(challenge.id),
        {
          challenge,
          component: "opposed_ready",
          detail: "Failed to reply with throwing message"
        }
      )
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: challenge.id,
          test_id,
          message_uid,
        })
      })
  },
}
