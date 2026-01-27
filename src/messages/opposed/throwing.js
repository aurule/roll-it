import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import throw_picker from "../../components/opposed/throw-picker.js"
import go_button from "../../components/opposed/go-button.js"
import build from "../../util/message-builders.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.Throwing

/**
 * Message to gather throw requests from both participants
 *
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function messageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const participants = opposed_db.getParticipants(challenge_id)
  const attacker = participants.get("attacker")
  const defender = participants.get("defender")
  const previous_test = opposed_db.getPenultimateTest(challenge_id)

  const t = i18n.getFixedT(challenge.locale, "opposed", "throws")
  const hist_t = i18n.getFixedT(challenge.locale, "opposed", "shared.history")

  let blurb
  if (previous_test.retest_reason) {
    blurb = hist_t(`retest.${previous_test.retest_reason}`, {
      retester: previous_test.retester.mention,
      ability: challenge.retest_ability,
    })
  } else {
    blurb = t("first")
  }

  const components = [
    build.text(blurb),
    build.text(t("request", { participant: attacker.mention })),
    build.actions(throw_picker.data(challenge.locale, attacker)),
    build.text(t("disclaimer")),
    build.separator(),
    build.text(t("request", { participant: defender.mention })),
    build.actions(throw_picker.data(challenge.locale, defender)),
    build.text(t("disclaimer")),
    build.separator(),
    build.text(t("cta")),
    build.actions(go_button.data(challenge.locale)),
  ]
  return build.message(components, { withResponse: true })
}

/**
 * Add reactions to new prompt from retry handler
 * @param  {Message} message Discord message object for the prompt
 */
export async function afterRetry(message) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(message.id)

  if (opposed_db.didParticipantChop(test.attacker.id, test.id)) {
    await message.react("🗡️").catch((err) => {
      logger.warn(
        {
          err,
          test,
        },
        "Could not react with attacker emoji",
      )
    })
  }
  if (opposed_db.didParticipantChop(test.defender.id, test.id)) {
    await message.react("🛡️").catch((err) => {
      logger.warn(
        {
          err,
          test,
        },
        "Could not react with defender emoji",
      )
    })
  }
}
