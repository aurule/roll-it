const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")

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
    //
  }
}
