const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const conceded_message = require("../../messages/opposed/conceded")

module.exports = {
  name: "opposed_continue",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.cancelling.components.continue")
    return new ButtonBuilder()
      .setCustomId("opposed_continue")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Primary)
  },
  async execute(interaction) {
    // update test record
    // * set cancelled_with
    // * generate new history
    // create new test record
    // set state to Throwing
    // edit cancelling message to be inert
    // send throwing message
  },
}
