const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")

module.exports = {
  name: "install_systems",
  valid_states: ["summary"],
  data: (locale) => {
    const t = i18n.getFixedT(locale, "install", "shared.components.systems")
    return new ButtonBuilder()
      .setCustomId("install_systems")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Primary)
  },
  async execute(interaction) {
    //
  }
}
