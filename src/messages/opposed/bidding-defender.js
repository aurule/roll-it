import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { makeBreakdown } from "../../services/opposed/breakdown.js"
import { makeHistory } from "../../services/opposed/history.js"
import { i18n } from "../../locales/index.js"
import { messageData as winningMessage } from "./winning.js"
import { messageData as tyingMessage } from "./tying.js"
import * as build from "../../util/message-builders.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.BiddingDefender

/**
 * Get the internal ID of the participant with the most bid traits
 * @param  {Chop[]} chops Array of thrown chops
 * @return {int|null}     Internal ID of the winning participant, or null if traits are equal
 */
export function getLeaderId(chops) {
  if (chops[0].traits == chops[1].traits) {
    return null
  }
  if (chops[0].traits > chops[1].traits) {
    return chops[0].participant_id
  }
  return chops[1].participant_id
}

/**
 * Message shown to gather the defending participant's trait bid during a tied test
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallengeWithParticipants(challenge_id)
  const test = opposed_db.getLatestTest(challenge_id)
  const chops = opposed_db.getChopsForTest(test.id)
  const attacker_chop = chops.find((c) => c.participant_id === challenge.attacker.id)

  const t = i18n.getFixedT(challenge.locale, "opposed", "bidding")
  const components = [
    build.text(t("prompt", { participant: challenge.defender.mention })),
    build.text(
      t("traits", {
        participant: challenge.attacker.mention,
        count: attacker_chop.traits,
      }),
    ),
  ]
  return build.message(components, {
    withResponse: true,
    allowedMentions: { users: [challenge.defender.user_uid] },
  })
}

/**
 * Handle user replies
 * @param  {Interaction} interaction Discord message interaction
 * @return {Promise}                 Message reply promise
 */
export async function onReply(msg_interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(msg_interaction.reference.messageId)

  const t = i18n.getFixedT(msg_interaction.guild.locale ?? "en-US", "opposed")

  msg_interaction.authorize(test.defender.user_uid)

  const traits_content = msg_interaction.content
  const clumped = traits_content.replace(/\s/, "")
  const match = clumped.match(/\d+/)
  if (match === null) {
    return msg_interaction.whisper(t("bidding.missing")).catch((error) =>
      logger.error(
        {
          err: error,
          test,
          reply_to: msg_interaction.reference.messageId,
          message: msg_interaction.id,
          content: traits_content,
        },
        "Could not whisper about missing number",
      ),
    )
  }

  const num = parseInt(match[0])
  if (Number.isNaN(num)) {
    return msg_interaction.whisper(t("bidding.invalid")).catch((error) =>
      logger.error(
        {
          err: error,
          test,
          reply_to: msg_interaction.reference.messageId,
          message: msg_interaction.id,
          content: traits_content,
        },
        "Could not whisper about invalid number",
      ),
    )
  }

  const participants = opposed_db.getParticipants(test.challenge_id, true)
  const chops = opposed_db.getChopsForTest(test.id)
  const user_chop = chops.find((c) => c.participant_id === test.defender.id)

  opposed_db.setChopTraits(user_chop.id, num)
  user_chop.traits = num

  const leader_id = getLeaderId(chops)
  const leader = participants.get(leader_id) ?? null
  const breakdown = makeBreakdown({
    leader,
    chops,
    participants,
    t,
  })

  opposed_db.setTestBreakdown(test.id, breakdown)
  test.breakdown = breakdown
  test.leader_id = leader_id
  const history = makeHistory(test)
  opposed_db.setTestHistory(test.id, history)

  if (leader) {
    opposed_db.setTestLeader(test.id, leader.id)
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.Winning)

    return msg_interaction
      .ensure("reply", winningMessage(test.challenge_id), {
        test,
        user_uid: msg_interaction.author.id,
        component: "go_button",
        detail: "Failed to send 'winning' prompt",
      })
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
        })
      })
  } else {
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.Tying)

    return msg_interaction
      .ensure("reply", tyingMessage(test.challenge_id), {
        test,
        user_uid: msg_interaction.author.id,
        component: "go_button",
        detail: "Failed to send 'tying' prompt",
      })
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
        })
      })
  }
}
