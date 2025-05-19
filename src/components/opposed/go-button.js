const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/interactive")
const { logger } = require("../../util/logger")

module.exports = {
  name: "go_button",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("go_button")
      .setLabel(i18n.t("opposed.throws.components.go", { ns: "interactive", lng: locale }))
      .setEmoji("1303828291492515932")
      .setStyle(ButtonStyle.Success),
  async execute(interaction) {
    const opposed_db = new Opposed()
    // get test
    //   if test is done, whisper with warning and outcome
    // get chop for user
    //   if undefined, whisper that you need to pick a symbol to throw first
    // set chop ready
    //   if changed, react to interaction.message with appropriate emoji: 🗡️ for attacker, 🛡️ for defender
    //
    // get opponent chop
    //   if undefined, return
    //
    // if opponent is also ready
    //
    // update each chop with their generated result
    // generate the outcome string
    // update test set done true, outcome to generated string
    // edit our message to show the outcome, no allowed mentions
    // reply with a summary message
  }
}
