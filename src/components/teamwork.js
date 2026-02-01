import { userMention } from "discord.js"
import { ComponentHandler } from "./component-handler.js"
import { Teamwork } from "../db/teamwork.js"
import { teamworkTimeout } from "../interactive/teamwork.js"
import { logger } from "../util/logger.js"
import { i18n } from "../locales/index.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { sendError } from "../services/metrics.js"

import cancelButton from "./teamwork/cancel-button.js"
import helperPicker from "./teamwork/helper-picker.js"
import rollButton from "./teamwork/roll-button.js"

export const components = [cancelButton, helperPicker, rollButton]

export default new ComponentHandler(handle, components)

/**
 * Handle an interaction
 *
 * This ensures the test is active and then dispatches handling to the appropriate component object.
 *
 * @param  {Interaction} interaction Discord component interaction
 * @return {Promise}                 Promise from the component
 */
export async function handle(interaction) {
  const teamwork_db = new Teamwork()

  // ensure the component's message still exists in the database
  if (!teamwork_db.hasMessage(interaction.message.id)) {
    return interaction.ensure(
      "whisper",
      i18n.t("concluded", { lng: interaction.locale, ns: "teamwork" }),
      {
        component: interaction.customId,
        message: interaction.message,
        detail: "could not whisper about missing teamwork test from message",
      },
    )
  }

  /*
   * handle case where
   * - message exists
   * - teamwork test is past its expiry time
   * - teamwork test is not yet marked as concluded
   */
  if (teamwork_db.isMessageExpired(interaction.message.id)) {
    const teamwork_test = teamwork_db.findTestByMessage(interaction.message.id)
    await teamworkTimeout(teamwork_test.id)
    return interaction.ensure(
      "whisper",
      i18n.t("concluded", { lng: interaction.locale, ns: "teamwork" }),
      {
        test: teamwork_test,
        component: interaction.customId,
        message: interaction.message,
        detail: "could not whisper about expired teamwork test",
      },
    )
  }

  const component = components.get(interaction.customId)
  return component.execute(interaction).catch((err) => {
    if (err instanceof UnauthorizedError) {
      logger.info({
        user: interaction.user,
        component: component.name,
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
            component: component.name,
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
        component: component.name,
      })
    }
  })
}
