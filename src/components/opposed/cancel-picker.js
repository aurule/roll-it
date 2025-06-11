const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_cancel_select",
  data: (challenge) => {
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.cancelling.components.picker")
    return new StringSelectMenuBuilder()
      .setCustomId("opposed_cancel_select")
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { returnObjects: true }))
      .setMinValues(1)
      .setMaxValues(1)
  },
  async execute(interaction) {
    //
  },
}
