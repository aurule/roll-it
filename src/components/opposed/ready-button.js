const { ButtonBuilder, ButtonStyle, TextDisplayBuilder } = require("discord.js")
const { editMessage } = require("../../services/api")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { logger } = require("../../util/logger")
const throwing_message = require("../../messages/opposed/throwing")

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
  valid_states: ["advantages-attacker", "advantages-defender"],
  data: (locale, participant) =>
    new ButtonBuilder()
      .setCustomId(`opposed_ready_${participant.id}`)
      .setLabel(i18n.t("opposed.shared.ready", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Success),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")
    const participant_id = parseInt(interaction.customId.match(/_(\d+)/)[1])
    const allowed_participant = opposed_db.getParticipant(participant_id)

    interaction.authorize(allowed_participant.user_uid)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (allowed_participant.id === attacker.id) {
      const advantages_attacker = require("../../message/opposed/advantages_attacker")
      await interaction
        .ensure("editReply", advantages_attacker.inert(challenge.id), {
          challenge,
          user_uid: interaction.user.id,
          component: "opposed_ready",
          detail: "Failed to edit attacker advantages prompt to show result",
        })
        .catch(() => {
          // suppress all other errors so we can try to send something else
          return
        })

      opposed_db.setChallengeState(challenge.id, Challenge.States.AdvantagesDefender)

      const advantages_defender = require("../../message/opposed/advantages_defender")
      return interaction
        .ensure("followUp", advantages_defender.data(challenge.id), {
          challenge,
          user_uid: interaction.user.id,
          component: "opposed_ready",
          detail: "Failed to send defender advantages prompt",
        })
        .then((reply_result) => {
          const message_uid = reply_result.id

          opposed_db.addMessage({
            challenge_id: test.challenge_id,
            message_uid,
          })
        })
    }

    const advantages_defender = require("../../message/opposed/advantages_defender")
    await interaction
      .ensure("editReply", advantages_defender.inert(challenge.id), {
        test,
        user_uid: interaction.user.id,
        component: "opposed_ready",
        detail: "Failed to edit defender advantages prompt to show result",
      })
      .catch(() => {
        // suppress all other errors so we can try to send something else
        return
      })

    const summary_args = {
      attacker: attacker.mention,
      attacker_advantages: attacker.advantages.map((a) => t(`shared.advantages.${a}`)),
      defender: defender.mention,
      defender_advantages: defender.advantages.map((a) => t(`shared.advantages.${a}`)),
      attribute: challenge.attribute,
      conditions: challenge.conditions.map((c) => t(`shared.conditions.${c}`)),
      retest: challenge.retest_ability,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }
    const challenge_summary = t("shared.summary", summary_args)
    opposed_db.setChallengeSummary(challenge.id, challenge_summary)

    opposed_db.setTieWinner(tieWinnerId(attacker, defender))
    opposed_db.setChallengeState(challenge.id, Challenge.States.Throwing)

    const test_id = opposed_db.addTest({
      challenge_id: challenge.id,
      locale: challenge.locale,
    }).lastInsertRowid

    await editMessage(challenge.channel_uid, interaction.message.id, {
      components: [new TextDisplayBuilder({ content: challenge_summary })],
      allowedMentions: { parse: [] },
    }).catch((error) =>
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
      .ensure("reply", throwing_message.data(challenge.id), {
        challenge,
        component: "opposed_ready",
        detail: "Failed to reply with throwing message",
      })
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
