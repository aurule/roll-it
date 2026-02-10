import { Opposed } from "../../db/opposed.js"
import { i18n } from "../../locales/index.js"
import withdraw_button from "../../components/opposed/withdraw-retest-button.js"
import cancel_picker from "../../components/opposed/cancel-picker.js"
import cancel_button from "../../components/opposed/cancel-button.js"
import continue_button from "../../components/opposed/continue-button.js"
import * as build from "../../util/message-builders.js"
import { Participant } from "../../db/opposed/participant.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Cancelling

/**
 * Message shown to allow cancelling an ability retest
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const test = opposed_db.getLatestTest(challenge_id)

  const t = i18n.getFixedT(challenge.locale, "opposed", "cancelling")

  const reason = test.retest_reason

  const components = [
    build.text(
      t(`headline.${reason}`, {
        retester: test.retester.mention,
        ability: challenge.retest_ability,
      }),
    ),
    build.section(t("withdraw"), withdraw_button.data(challenge.locale)),
    build.separator(),
    build.text(t("cancel", { canceller: test.canceller.mention })),
  ]

  if (test.canceller.advantages.includes(Participant.Advantages.Cancels)) {
    components.push(build.actions(cancel_picker.data(challenge.locale)))
    components.push(build.text(t("disclaimer")))
  }

  components.push(
    build.actions(cancel_button.data(challenge.locale), continue_button.data(challenge.locale)),
  )

  return build.message(components, { withResponse: true })
}

/**
 * Inert cancelling message with a summary of the action taken
 * @param  {number}         challenge_id Internal ID of the challenge record
 * @param  {string}         action       Name of the action taken. One of "continue", "withdraw", or "cancel".
 * @return {MessageBuilder}              Message data object
 */
export function inertMessageData(challenge_id, action = "continue") {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const test = opposed_db.getLatestTest(challenge_id)
  const t = i18n.getFixedT(challenge.locale, "opposed", "cancelling")

  const lines = [
    t(`headline.${test.retest_reason}`, {
      retester: test.retester.mention,
      ability: challenge.retest_ability,
    }),
  ]

  switch (action) {
    case "continue":
      break
    case "withdraw":
      lines.push(t("withdrawn"))
      break
    case "cancel":
      lines.push(
        i18n.t("shared.history.cancelled", {
          ns: "opposed",
          lng: challenge.locale,
          canceller: test.canceller.mention,
          reason: test.cancelled_with,
        }),
      )
      break
    default:
      throw new Error(`Unsupported action "${action}"`)
  }

  const body = lines.join(" ")

  return build.textMessage(body, { withResponse: true })
}
