import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { i18n } from "../../locales/index.js"
import build from "../../util/message-builders.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Accepted

/**
 * Message shown after a tied result is accepted.
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const t = i18n.getFixedT(challenge.locale, "opposed")

  const t_args = {
    summary: challenge.summary,
  }
  return build.textMessage(t("accepted", t_args), { withResponse: true })
}
