import { Opposed } from "../../db/opposed.js"
import { i18n } from "../../locales/index.js"
import withdraw_button from "../../components/opposed/withdraw-challenge-button.js"
import condition_picker from "../../components/opposed/condition-picker.js"
import advantage_picker from "../../components/opposed/advantage-picker.js"
import ready_button from "../../components/opposed/ready-button.js"
import build from "../../util/message-builders.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Challenge state this message is shown for
 * @see Challenge.States Enum of valid state strings
 * @type {string}
 */
export const challengeState = Challenge.States.AdvantagesAttacker

/**
 * Message shown at the start of a challenge
 *
 * This has controls for the challenge initiator to set their advantages as well as the general conditions
 * of the test, or to immediately cancel the entire challenge.
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

  const t = i18n.getFixedT(challenge.locale, "opposed", "advantages-attacker")
  const shared_t = i18n.getFixedT(challenge.locale, "opposed", "shared")

  const components = [
    build.text(
      t("summary", {
        attacker: attacker.mention,
        defender: defender.mention,
        description: challenge.description,
        context: challenge.description ? "description" : undefined,
        attribute: shared_t(`attributes.${challenge.attribute}`),
        retest: challenge.retest_ability,
      }),
    ),
    build.section(t("withdraw"), withdraw_button.data(challenge.locale)),
    build.separator(),
    build.text(t("conditions")),
    build.actions(condition_picker.data(challenge.locale)),
    build.text(t("advantages")),
    build.actions(advantage_picker.data(challenge.locale, attacker)),
    build.text(t("ready")),
    build.actions(ready_button.data(challenge.locale, attacker)),
  ]

  return build.message(components, {
    withResponse: true,
    allowedMentions: { users: [attacker.user_uid] },
  })
}

/**
 * Inert version of the advantage picker for attackers
 * @param {number}          challenge_id Internal ID of the challenge record
 * @return {MessageBuilder}              Message data object
 */
export function inertMessageData(challenge_id) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.getChallenge(challenge_id)
  const participants = opposed_db.getParticipants(challenge_id)
  const attacker = participants.get("attacker")
  const defender = participants.get("defender")

  const t = i18n.getFixedT(challenge.locale, "opposed", "advantages-attacker")
  const shared_t = i18n.getFixedT(challenge.locale, "opposed", "shared")

  return build.textMessage(
    t("inert", {
      attacker: attacker.mention,
      defender: defender.mention,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
      attribute: shared_t(`attributes.${challenge.attribute}`),
      conditions: challenge.conditions.map((c) => shared_t(`conditions.${c}`)),
      retest: challenge.retest_ability,
      advantages: attacker.advantages.map((c) => shared_t(`advantages.${c}`)),
    }),
    {
      withResponse: true,
      allowedMentions: { parse: [] },
    },
  )
}
