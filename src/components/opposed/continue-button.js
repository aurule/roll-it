const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const throwing_message = require("../../messages/opposed/throwing")

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
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.canceller.user_uid)

    const cancelling_message = require("../../messages/opposed/cancelling")
    await interaction
      .ensure("edit", cancelling_message.inert(challenge.id), {
        component: "opposed_continue",
        test: test,
        challenge: challenge,
        detail: "failed to update cancelling message to remove controls",
      })
      .catch((error) => {
        // suppress all errors so we can send other messages
        return
      })

    const next_test_id = opposed_db.addTest({
      challenge_id: test.challenge_id,
      locale: test.locale,
    }).lastInsertRowid
    opposed_db.setChallengeState(ChallengeStates.Throwing)

    return interaction
      .ensure("reply", throwing_message.data(challenge.id), {
        component: "opposed_continue",
        test: test,
        challenge: challenge,
        detail: "failed to send throwing prompt",
      })
      .then((reply_result) => {
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: challenge.id,
          message_uid,
          test_id: next_test_id,
        })
      })
  },
}
