import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Installation } from "../../db/installation.js"
import { messageData as cancelledMessage} from "../../messages/installation/cancelled.js"
import { Component } from "../component.js"

export function data(locale) {
  const t = i18n.getFixedT(locale, "install", "shared.components.cancel")
  return new ButtonBuilder()
    .setCustomId("install_cancel")
    .setLabel(t("text"))
    .setStyle(ButtonStyle.Danger)
}

export async function execute(interaction) {
  const install_db = new Installation()
  const install = install_db.findInstallationByMessage(interaction.message.id)

  interaction.authorize(install.user_uid)

  install_db.finishInstallation(install.id)

  interaction.message.delete().catch((_error) => {
    // suppress all errors so we can send other messages
    return
  })

  interaction.ensure("reply", cancelledMessage(install.id), {
    install,
    detail: "failed to send cancellation message",
  })
}

/**
 * Button to cancel an install process
 */
export default new Component("install_cancel", data, execute)
