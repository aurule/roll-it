import { Opposed } from "../../db/opposed.js"
import { i18n } from "../../locales/index.js"
import accept_button from "../../components/opposed/accept-button.js"
import retest_picker from "../../components/opposed/retest-picker.js"
import retest_button from "../../components/opposed/retest-button.js"
import * as build from "../../util/message-builders.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Tying

/**
 * Status message shown when a result is tied
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const test = opposed_db.getLatestTest(challenge_id)
  const participants = opposed_db.getParticipants(challenge_id)
  const history = opposed_db.getChallengeHistory(challenge_id)

  const t = i18n.getFixedT(challenge.locale, "opposed")

  const components = [
    build.text(challenge.summary),
    build.text(t("shared.history.header")),
    build.text(history.join("\n")),
    build.separator(),
    build.text(
      t("tying.headline", {
        breakdown: test.breakdown,
      }),
    ),
    build.text(
      t("tying.cta", {
        attacker: participants.get("attacker").mention,
        defender: participants.get("defender").mention,
      }),
    ),
    build.actions(accept_button.data(challenge.locale)),
    build.text(t("shared.retest.cta")),
    build.actions(retest_picker.data(challenge.locale, challenge.retest_ability)),
    build.actions(retest_button.data(challenge.locale)),
  ]
  return build.message(components, { withResponse: true })
}

/**
 * Tying message with no components
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function inertMessageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const test = opposed_db.getLatestTest(challenge_id)
  const history = opposed_db.getChallengeHistory(challenge_id)

  const t = i18n.getFixedT(challenge.locale, "opposed")

  const components = [
    build.text(
      t("tying.headline", {
        breakdown: test.breakdown,
      }),
    ),
    build.separator(),
    build.text(challenge.summary),
    build.text(t("shared.history.header")),
    build.text(history.join("\n")),
  ]
  return build.message(components, { withResponse: true })
}
