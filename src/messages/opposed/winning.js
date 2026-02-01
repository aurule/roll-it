import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { i18n } from "../../locales/index.js"
import concede_button from "../../components/opposed/concede-button.js"
import retest_picker from "../../components/opposed/retest-picker.js"
import retest_button from "../../components/opposed/retest-button.js"
import * as build from "../../util/message-builders.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Winning

/**
 * Status message shown when there is a winner from the latest test
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
    build.text(challenge.summary),
    build.text(t("shared.history.header")),
    build.text(history),
    build.separator(),
    build.text(
      t("winning.headline", {
        leader: test.leader.mention,
        breakdown: test.breakdown,
      }),
    ),
    build.text(
      t("winning.cta", {
        leader: test.leader.mention,
        trailer: test.trailer.mention,
      }),
    ),
    build.actions(concede_button.data(challenge.locale)),
    build.text(t("shared.retest.cta")),
    build.actions(retest_picker.data(challenge.locale, challenge.retest_ability)),
    build.actions(retest_button.data(challenge.locale)),
  ]
  return build.message(components, { withResponse: true })
}

/**
 * Winning prompt with no components
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
      t("winning.headline", {
        leader: test.leader.mention,
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
