const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")

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
    test.retester = opposed_db.getParticipant(test.retester_id)

    if (interaction.user.id !== test.retester.user_uid) {
      return interaction.ensure(
        "whisper",
        t("unauthorized", { participants: [test.retester.mention] }),
        {
          user: interaction.user.id,
          component: "opposed_withdraw_retest",
          challenge_id: test.challenge_id,
          test_id: test.id,
          detail: `Failed to whisper about unauthorized usage from ${interaction.user.id}`
        }
      )
    }

    // todo update the test
    // * remove retester_id and retest_reason
    // * generate new history

    const cancelling_message = require("../../messages/opposed/cancelling")
    await interaction
      .ensure(
        "edit",
        cancelling_message.inert(test.challenge_id),
        {
          component: "opposed_withdraw_retest",
          test: test,
          detail: "failed to update retest cancelling message to remove controls"
        }
      )
      .catch(error => {
        // suppress all errors so we can send other messages
        return
      })

    let state
    let message
    if (test.leader_id) {
      state = ChallengeStates.Winning
      message = require("../../messages/opposed/winning")
    } else {
      state = ChallengeStates.Tying
      message = require("../../messages/opposed/tying")
    }
    opposed_db.setChallengeState(test.challenge_id, state)

    return interaction
      .ensure(
        "reply",
        message.data(test.challenge_id),
        {
          component: "opposed_withdraw_retest",
          test: test,
          detail: "failed to send new challenge summary message"
        }
      )
      .then((reply_result) => {
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
        })
      })
  },
}
