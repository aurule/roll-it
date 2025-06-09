const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const conceded_message = require("../../messages/opposed/conceded")

module.exports = {
  name: "opposed_cancel",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.cancelling.components.cancel")
    return new ButtonBuilder()
      .setCustomId("opposed_cancel")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Danger)
  },
  async execute(interaction) {
    // update test record
    // * set cancelled_with
    // * generate new history
    // set challenge state to Winning/Tying
    // edit cancelling message to inert
    // send appropriate status message
  },
}
