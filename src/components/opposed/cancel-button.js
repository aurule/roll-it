const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { makeHistory } = require("../../services/opposed/history")
const { OpTest } = require("../../db/opposed/optest")

/**
 * Button shown when a retest can be cancelled
 */
module.exports = {
  name: "opposed_cancel",
  valid_states: ["cancelling"],
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.cancelling.components.cancel")
    return new ButtonBuilder()
      .setCustomId("opposed_cancel")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Danger)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.canceller.user_uid)

    if (!test.cancelled_with) {
      const t = i18n.getFixedT(test.locale, "interactive", "opposed.cancelling")
      return interaction.ensure("whisper", t("missing"), {
        component: "opposed_cancel",
        test: test,
        detail: "failed to whisper about missing cancel reason ",
      })
    }

    opposed_db.setTestCancelled(test.id)
    test.cancelled = true
    opposed_db.setTestHistory(test.id, makeHistory(test))
    if (test.cancelled_with === OpTest.CancelReasons.Ability) {
      opposed_db.setParticipantAbilityUsed(test.canceller.id)
    }

    const cancelling_message = require("../../messages/opposed/cancelling")
    await interaction
      .ensure("edit", cancelling_message.inert(test.challenge_id, "cancel"), {
        component: "opposed_cancel",
        test: test,
        detail: "failed to update cancelling message to remove controls",
      })
      .catch((_error) => {
        // suppress all errors so we can send other messages
        return
      })

    let next_message
    if (test.leader) {
      opposed_db.setChallengeState(test.challenge_id, Challenge.States.Winning)
      next_message = require("../../messages/opposed/winning")
    } else {
      opposed_db.setChallengeState(test.challenge_id, Challenge.States.Tying)
      next_message = require("../../messages/opposed/tying")
    }

    return interaction
      .ensure("reply", next_message.data(test.challenge_id), {
        component: "opposed_cancel",
        test: test,
        detail: `failed to send ${next_message.state} prompt`,
      })
      .then((reply_result) => {
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
          test_id: test.id,
        })
      })
  },
}
