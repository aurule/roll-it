const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")

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
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.canceller.user_uid)

    if (!test.cancelled_with) {
      const t = i18n.getFixedT(locale, "interactive", "opposed.cancelling")
      return interaction.ensure("whisper", t("missing"), {
        component: "opposed_cancel",
        test: test,
        challenge: challenge,
        detail: "failed to whisper about missing cancel reason ",
      })
    }

    opposed_db.setTestCancelled(test.id)
    test.cancelled = true
    opposed_db.setTestHistory(test.id, makeHistory(test))
    if (test.cancelled_with === "ability") {
      opposed_db.setParticipantAbilityUsed(test.canceller.id)
    }

    const cancelling_message = require("../../messages/opposed/cancelling")
    await interaction
      .ensure("edit", cancelling_message.inert(challenge.id), {
        component: "opposed_cancel",
        test: test,
        challenge: challenge,
        detail: "failed to update cancelling message to remove controls",
      })
      .catch((error) => {
        // suppress all errors so we can send other messages
        return
      })

    let next_message
    if (test.leader) {
      opposed_db.setChallengeState(challenge.id, ChallengeStates.Winning)
      next_message = require("../../messages/opposed/winning")
    } else {
      opposed_db.setChallengeState(challenge.id, ChallengeStates.Tying)
      next_message = require("../../messages/opposed/tying")
    }

    return interaction
      .ensure("reply", next_message.data(challenge.id), {
        component: "opposed_cancel",
        test: test,
        challenge: challenge,
        detail: `failed to send ${next_message.state} prompt`,
      })
      .then((reply_result) => {
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: challenge.id,
          message_uid,
          test_id: test.id,
        })
      })
  },
}
