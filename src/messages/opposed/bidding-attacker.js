import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { i18n } from "../../locales/index.js"
import { messageData as biddingDefender } from "./bidding-defender.js"
import * as build from "../../util/message-builders.js"
import { extractNumber } from "../../util/extract-number.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.BiddingAttacker

/**
 * Message shown to gather the attacking participant's trait bid during a tied test
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const participants = opposed_db.getParticipants(challenge_id)

  const t = i18n.getFixedT(challenge.locale, "opposed", "bidding")
  return build.textMessage(t("prompt", { participant: participants.get("attacker").mention }), {
    withResponse: true,
  })
}

/**
 * Handle user replies
 * @param  {Interaction} interaction Discord message interaction
 * @return {Promise}                 Message reply promise
 */
export async function onReply(interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(interaction.message.reference.messageId)

  const t = i18n.getFixedT(interaction.guild.locale ?? "en-US", "opposed", "bidding")

  interaction.authorize(test.attacker.user_uid)

  const matched_number = extractNumber(interaction.content)
  if (matched_number === undefined) {
    return interaction.whisper(t("missing")).catch((error) =>
      logger.error(
        {
          err: error,
          reply_to: interaction.message.reference.messageId,
          message: interaction.id,
          content: traits_content,
        },
        "Could not whisper about missing number",
      ),
    )
  }

  if (Number.isNaN(matched_number)) {
    return interaction.whisper(t("invalid")).catch((error) =>
      logger.error(
        {
          err: error,
          reply_to: interaction.reference.messageId,
          message: interaction.id,
          content: traits_content,
        },
        "Could not whisper about invalid number",
      ),
    )
  }

  const chops = opposed_db.getChopsForTest(test.id)
  const user_chop = chops.find((c) => c.participant_id === test.attacker.id)

  opposed_db.setChopTraits(user_chop.id, matched_number)
  opposed_db.setChallengeState(test.challenge_id, Challenge.States.BiddingDefender)
  return interaction
    .ensure("reply", biddingDefender(test.challenge_id), {
      test,
      attacker: test.attacker,
      user_chop,
      traits: matched_number,
      detail: "Failed to send defender bid prompt",
    })
    .then((reply_result) => {
      const message_uid = reply_result.id

      opposed_db.addMessage({
        challenge_id: test.challenge_id,
        message_uid,
        test_id: test.id,
      })
    })
}
