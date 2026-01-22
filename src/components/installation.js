import { userMention } from "discord.js"
import { ComponentHandler } from "./component-handler.js"
import { Installation } from "../db/installation.js"
import { logger } from "../util/logger.js"
import { i18n } from "../locales/index.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { sendError } from "../services/metrics.js"

import cancelButton from "./installation/cancel-button.js"
import changeButton from "./installation/change-button.js"
import saveButton from "./installation/save-button.js"

export const components = [cancelButton, changeButton, saveButton]

export default new ComponentHandler(handle, components)

/**
 * Handle an interaction
 *
 * This ensures the installation is active and then dispatches handling to the appropriate component object.
 *
 * @param  {Interaction} interaction Discord component interaction
 * @return {Promise}                 Promise from the component
 */
export async function handle(interaction) {
  const install_db = new Installation()
  const message_id = interaction.message.id
  const component_name = interaction.customId

  const component = components.get(component_name)
  const installation = install_db.findInstallationByMessage(message_id)

  // fail unless installation exists, is current, and is not finished
  if (installation === undefined || installation.expired || installation.finished) {
    return interaction.ensure(
      "whisper",
      i18n.t("finished", { lng: interaction.locale, ns: "install" }),
      {
        user: interaction.user.id,
        component: component_name,
        installation,
        detail: `Could not whisper about invalid install from ${component_name}`,
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
