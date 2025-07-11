const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")

module.exports = {
  name: "opposed_withdraw_retest",
  data: (locale) => {
    return new ButtonBuilder()
      .setCustomId("opposed_withdraw_retest")
      .setLabel(i18n.t("opposed.shared.withdraw", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Secondary)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.retester.user_uid)

    opposed_db.setTestRetested(test.id, false)
    if (AbilityReasons.has(test.retest_reason)) {
      opposed_db.setParticipantAbilityUsed(test.retester_id)
    }

    const cancelling_message = require("../../messages/opposed/cancelling")
    await interaction
      .ensure("edit", cancelling_message.inert(test.challenge_id), {
        component: "opposed_withdraw_retest",
        test: test,
        detail: "failed to update retest cancelling message to remove controls",
      })
      .catch(() => {
        // suppress all errors so we can send other messages
        return
      })

    let state
    let message
    if (test.leader_id) {
      state = Challenge.States.Winning
      message = require("../../messages/opposed/winning")
    } else {
      state = Challenge.States.Tying
      message = require("../../messages/opposed/tying")
    }
    opposed_db.setChallengeState(test.challenge_id, state)

    return interaction
      .ensure("reply", message.data(test.challenge_id), {
        component: "opposed_withdraw_retest",
        test: test,
        detail: "failed to send new challenge summary message",
      })
      .then((reply_result) => {
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
        })
      })
  },
}
