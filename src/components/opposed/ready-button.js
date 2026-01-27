import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { messageData as throwingMessage } from "../../messages/opposed/throwing.js"
import { OpposedComponent } from "../opposed-component.js"
import { inertMessageData as inertAdvantagesAttacker } from "../../messages/opposed/advantages-attacker.js"
import { messageData as advantagesDefender, inertMessageData as inertAdvantagesDefender } from "../../messages/opposed/advantages-defender.js"

/**
 * Determine which participant wins on a tied result
 *
 * @param  {Participant} attacker Attacking participant
 * @param  {Participant} defender Defending participant
 * @return {int|null}             ID of the participant who wins ties, or null if neither does.
 */
export function tieWinnerId(attacker, defender) {
  const attacker_ties = attacker.advantages.includes("ties")
  const defender_ties = defender.advantages.includes("ties")

  if (attacker_ties == defender_ties) return null
  if (attacker_ties) return attacker.id
  return defender.id
}

/**
 * Button to finalize a user's advantages
 *
 * For the attacker, this also finalizes the challenge conditions.
 */
export default new OpposedComponent("opposed_ready", data, execute, Challenge.States.AdvantagesAttacker, Challenge.States.AdvantagesDefender)

export function data(locale, participant) {
  return new ButtonBuilder()
    .setCustomId(`opposed_ready_${participant.id}`)
    .setLabel(i18n.t("shared.ready", { ns: "opposed", lng: locale }))
    .setStyle(ButtonStyle.Success)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
  const participants = opposed_db.getParticipants(challenge.id)
  const attacker = participants.get("attacker")
  const defender = participants.get("defender")
  const participant_id = parseInt(interaction.customId.match(/_(\d+)/)[1])
  const allowed_participant = opposed_db.getParticipant(participant_id)

  interaction.authorize(allowed_participant.user_uid)

  const t = i18n.getFixedT(challenge.locale, "opposed")

  if (allowed_participant.id === attacker.id) {
    await interaction.message.edit(inertAdvantagesAttacker(challenge.id)).catch(() => {
      // suppress all other errors so we can try to send something else
      return
    })

    opposed_db.setChallengeState(challenge.id, Challenge.States.AdvantagesDefender)

    return interaction
      .ensure("reply", advantagesDefender(challenge.id), {
        challenge,
        user_uid: interaction.user.id,
        component: "opposed_ready",
        detail: "Failed to send defender advantages prompt",
      })
      .then((reply_result) => {
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: challenge.id,
          message_uid,
        })
      })
  }

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

  await interaction.message.edit(inertAdvantagesDefender(challenge.id)).catch(() => {
    // suppress all other errors so we can try to send something else
    return
  })

  return interaction
    .ensure("reply", throwingMessage(challenge.id), {
      challenge,
      component: "opposed_ready",
      detail: "Failed to reply with throwing message",
    })
    .then((reply_result) => {
      // expect an InteractionCallbackResponse, but deal with a Message too
      const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

      opposed_db.addMessage({
        challenge_id: challenge.id,
        test_id,
        message_uid,
      })
    })
}
