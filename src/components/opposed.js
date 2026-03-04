import { userMention } from "discord.js"
import { Opposed } from "../db/opposed.js"
import { logger } from "../util/logging/setup.js"
import { i18n } from "../locales/index.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { sendError } from "../services/metrics.js"
import { ComponentHandler } from "./component-handler.js"

import acceptButton from "./opposed/accept-button.js"
import advantagePicker from "./opposed/advantage-picker.js"
import cancelButton from "./opposed/cancel-button.js"
import cancelPicker from "./opposed/cancel-picker.js"
import concedeButton from "./opposed/concede-button.js"
import conditionPicker from "./opposed/condition-picker.js"
import continueButton from "./opposed/continue-button.js"
import goButton from "./opposed/go-button.js"
import readyButton from "./opposed/ready-button.js"
import relentButton from "./opposed/relent-button.js"
import retestButton from "./opposed/retest-button.js"
import retestPicker from "./opposed/retest-picker.js"
import throwPicker from "./opposed/throw-picker.js"
import withdrawChallengeButton from "./opposed/withdraw-challenge-button.js"
import withdrawRetestButton from "./opposed/withdraw-retest-button.js"

export const components = [
  acceptButton,
  advantagePicker,
  cancelButton,
  cancelPicker,
  concedeButton,
  conditionPicker,
  continueButton,
  goButton,
  readyButton,
  relentButton,
  retestButton,
  retestPicker,
  throwPicker,
  withdrawChallengeButton,
  withdrawRetestButton,
]

export default new ComponentHandler(handle, components)

/**
 * Regex matching an underscore followed by one or more digits
 * @type {RegExp}
 */
const num_regex = new RegExp(/_\d+/, "gi")

/**
 * Sanitize a component ID
 *
 * This removes any trailing database ID.
 *
 * @param  {str} customId ID to sanitize
 * @return {str}          Sanitized ID
 */
export function sanitize_id(customId) {
  return customId.replaceAll(num_regex, "")
}

/**
 * Handle an interaction
 *
 * This ensures the challenge (and possibly test) is active and then dispatches handling to the appropriate
 * component object.
 *
 * @param  {Interaction} interaction Discord component interaction
 * @return {Promise}                 Promise from the component
 */
export async function handle(interaction) {
  const opposed_db = new Opposed()
  const message_id = interaction.message.id
  const component_name = sanitize_id(interaction.customId)

  const component = this.components.get(component_name)
  const challenge = opposed_db.findChallengeByMessage(message_id)

  // fail unless challenge exists, is current, and is not finalized
  if (challenge === undefined || challenge.expired || challenge.finished) {
    return interaction.ensure(
      "whisper",
      i18n.t("concluded", { lng: interaction.locale, ns: "opposed" }),
      {
        user: interaction.user.id,
        component: interaction.customId,
        challenge,
        detail: `Could not whisper about invalid challenge from ${component_name}`,
      },
    )
  }

  // fail unless component is valid for current state, or message is for an old test
  if (
    !(component.states.includes(challenge.state) && opposed_db.messageIsForLatestTest(message_id))
  ) {
    return interaction.ensure(
      "whisper",
      i18n.t("outdated", { lng: interaction.locale, ns: "opposed" }),
      {
        user: interaction.user.id,
        component: interaction.customId,
        challenge,
        detail: `Could not whisper about incorrect state from ${component_name}`,
      },
    )
  }

  return component.execute(interaction).catch((err) => {
    if (err instanceof UnauthorizedError) {
      logger.info({
        user: interaction.user,
        component: component_name,
        detail: "unauthorized component interaction",
      })
      return interaction
        .whisper(
          i18n.t("unauthorized", {
            ns: "opposed",
            lng: interaction.locale,
            participants: err.allowed_uids.map(userMention),
          }),
        )
        .catch((err) => {
          logger.warn({
            err,
            user: interaction.user,
            component: component_name,
          })
        })
    } else {
      sendError(err, {
        user: interaction.user,
        component: component_name,
      })
      logger.error({
        err,
        user: interaction.user,
        component: component_name,
      })
    }
  })
}
