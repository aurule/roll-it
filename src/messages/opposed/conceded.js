import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { i18n } from "../../locales/index.js"
import build from "../../util/message-builders.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Conceded

/**
 * Message shown when one participant refuses to challenge the current win of their opponent
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const test = opposed_db.getLatestTest(challenge_id)
  const history = opposed_db.getChallengeHistory(challenge_id).join("\n")

  const t = i18n.getFixedT(challenge.locale, "opposed")

  const components = [
    build.text(
      t("conceded", {
        leader: test.leader.mention,
        trailer: test.trailer.mention,
      }),
    ),
    build.separator(),
    build.text(challenge.summary),
    build.text(t("shared.history.header")),
    build.text(history),
  ]
  return build.message(components, { withResponse: true })
}
