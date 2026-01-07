const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Installation } = require("../../db/installation")

/**
 * Button to make changes to installed commands
 */
module.exports = {
  name: "install_change",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "install", "shared.components.change")
    return new ButtonBuilder()
      .setCustomId("install_change")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Primary)
  },
  async execute(interaction) {
    const install_db = new Installation()
    const install = install_db.findInstallationByMessage(interaction.message.id)

    interaction.authorize(install.user_uid)

    const changeInstalled = require("../../modals/change-installed")
    const modal = changeInstalled.data(install)

    return interaction.showModal(modal)
  },
}
