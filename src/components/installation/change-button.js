import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Installation } from "../../db/installation.js"
import { Component } from "../component.js"
import changeInstalled from "../../modals/change-installed.js"

/**
 * Button to make changes to installed commands
 */
export default new Component("install_change", data, execute)

export function data(locale) {
  const t = i18n.getFixedT(locale, "install", "shared.components.change")
  return new ButtonBuilder()
    .setCustomId("install_change")
    .setLabel(t("text"))
    .setStyle(ButtonStyle.Primary)
}

export async function execute(interaction) {
  const install_db = new Installation()
  const install = install_db.findInstallationByMessage(interaction.message.id)

  interaction.authorize(install.user_uid)

  const modal = changeInstalled.data(install)

  return interaction.showModal(modal)
}
