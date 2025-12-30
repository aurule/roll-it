const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Installation } = require("../../db/installation")
const cancelled = require("../../messages/installation/cancelled")

module.exports = {
  name: "install_cancel",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "install", "shared.components.cancel")
    return new ButtonBuilder()
      .setCustomId("install_cancel")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Danger)
  },
  async execute(interaction) {
    const install_db = new Installation()
    const install = install_db.findInstallationByMessage(interaction.message.id)

    interaction.authorize(install.user_uid)

    install_db.finishInstallation(install.id)

    interaction.message
      .delete()
      .catch((_error) => {
        // suppress all errors so we can send other messages
        return
      })

    interaction.ensure(
      "reply",
      cancelled.data(install.id),
      {
        install,
        detail: "failed to send cancellation message",
      }
    )
  }
}
