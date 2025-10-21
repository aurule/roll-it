const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")
const { makeHistory } = require("../../services/opposed/history")

/**
 * Button to walk back a retest while the other participant has the option to cancel it
 */
module.exports = {
  name: "opposed_withdraw_retest",
  valid_states: ["cancelling"],
  data: (locale) => {
    return new ButtonBuilder()
      .setCustomId("opposed_withdraw_retest")
      .setLabel(i18n.t("shared.withdraw", { ns: "opposed", lng: locale }))
      .setStyle(ButtonStyle.Secondary)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.retester.user_uid)

    opposed_db.setTestRetested(test.id, false)
    test.retested = false
    opposed_db.setTestHistory(test.id, makeHistory(test))
    if (OpTest.AbilityReasons.has(test.retest_reason)) {
      opposed_db.setParticipantAbilityUsed(test.retester_id, false)
    }

    const cancelling_message = require("../../messages/opposed/cancelling")
    await interaction.message
      .edit(cancelling_message.inert(test.challenge_id, "withdraw"))
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
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
        })
      })
  },
}
