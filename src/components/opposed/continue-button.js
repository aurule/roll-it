const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const throwing_message = require("../../messages/opposed/throwing")

/**
 * Button to continue a retest when participant has the option to cancel
 */
module.exports = {
  name: "opposed_continue",
  valid_states: ["cancelling"],
  data: (locale) => {
    const t = i18n.getFixedT(locale, "opposed", "cancelling.components.continue")
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
    await interaction.message
      .edit(cancelling_message.inert(test.challenge_id))
      .catch(() => {
        // suppress all errors so we can send other messages
        return
      })

    const next_test_id = opposed_db.addTest({
      challenge_id: test.challenge_id,
      locale: test.locale,
    }).lastInsertRowid
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.Throwing)

    return interaction
      .ensure("reply", throwing_message.data(test.challenge_id), {
        component: "opposed_continue",
        test: test,
        detail: "failed to send throwing prompt",
      })
      .then((reply_result) => {
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
          test_id: next_test_id,
        })
      })
  },
}
