import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { i18n } from "../../locales/index.js"
import * as build from "../../util/message-builders.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Expired

/**
 * Message shown for a challenge that has run out of time
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const participants = opposed_db.getParticipants(challenge_id)
  const t = i18n.getFixedT(challenge.locale, "opposed")

  const t_args = {
    attacker: participants.get("attacker").mention,
    defender: participants.get("defender").mention,
    description: challenge.description,
    context: challenge.description ? "description" : undefined,
  }

  const test = opposed_db.getLatestTest(challenge_id)
  if (!test.id) return build.textMessage(t("expired.empty", t_args))

  const history = opposed_db.getChallengeHistory(challenge_id)

  t_args.breakdown = test.breakdown
  t_args.leader = test.leader_id ? test.leader.mention : ""
  const key = test.leader ? "expired.winner" : "expired.tied"

  const components = [
    build.text(t(key, t_args)),
    build.separator(),
    build.text(challenge.summary),
    build.text(t("shared.history.header")),
    build.text(history.join("\n")),
  ]
  return build.message(components, { withResponse: true })
}
