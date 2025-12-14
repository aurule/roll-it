const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")

module.exports = {
  name: "install_features",
  valid_states: ["summary"],
  data: (locale) => {
    const t = i18n.getFixedT(locale, "install", "shared.components.features")
    return new ButtonBuilder()
      .setCustomId("install_features")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Secondary)
  },
  async execute(interaction) {
    //
  }
}
