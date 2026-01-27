import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { i18n } from "../../locales/index.js"
import build from "../../util/message-builders.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Relented

/**
 * Message shown when the defender relents to the challenge before any tests
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallengeWithParticipants(challenge_id)
  const t = i18n.getFixedT(challenge.locale, "opposed")

  const t_args = {
    attacker: challenge.attacker.mention,
    defender: challenge.defender.mention,
    description: challenge.description,
    context: challenge.description ? "description" : undefined,
  }
  return build.textMessage(t("relented", t_args), { withResponse: true })
}
