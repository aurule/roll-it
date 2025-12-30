const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")

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
    //
  }
}
