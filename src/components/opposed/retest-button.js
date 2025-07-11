const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")

const AbilityReasons = new Set(["named", "ability"])

function canCancel(test) {
  return (
    test.canceller.advantages.includes("cancels") ||
    (AbilityReasons.has(test.retest_reason) && !test.canceller.ability_used)
  )
}

module.exports = {
  name: "opposed_retest",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.shared.retest.button")
    return new ButtonBuilder()
      .setCustomId("opposed_retest")
      .setLabel(t("text"))
      .setEmoji(t("emoji"))
      .setStyle(ButtonStyle.Secondary)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)

    interaction.authorize(participants.map((p) => p.user_uid))

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const test = opposed_db.getLatestTestWithParticipants(challenge.id)

    if (!test.retest_reason) {
      return interaction.ensure("whisper", t("winning.retest.missing"), {
        component: "opposed_retest",
        test: test,
        challenge: challenge,
        detail: "failed to whisper about missing retest reason",
      })
    }

    if (test.retester.user_uid !== interaction.user.id) {
      return interaction.ensure("whisper", t("winning.retest.conflict"), {
        component: "opposed_retest",
        test: test,
        challenge: challenge,
        detail: "failed to whisper about conflicted retest",
      })
    }

    let message
    if (challenge.state === Challenge.States.Winning) {
      message = require("../../messages/opposed/winning")
    } else {
      message = require("../../messages/opposed/tying")
    }

    await interaction
      .ensure("edit", message.inert(challenge.id), {
        component: "opposed_retest",
        test: test,
        challenge: challenge,
        detail: "failed to update progress message to remove controls",
      })
      .catch(() => {
        // suppress all errors so we can send other messages
        return
      })

    opposed_db.setTestRetested(test.id)
    if (AbilityReasons.has(test.retest_reason)) {
      opposed_db.setParticipantAbilityUsed(test.retester_id)
    }

    let next_message
    if (canCancel(test)) {
      opposed_db.setChallengeState(challenge.id, Challenge.States.Cancelling)
      if (!test.canceller.advantages.includes("cancels")) {
        opposed_db.setTestCancelledWith(test.id, "ability")
      }
      next_message = require("../../messages/opposed/cancelling")
    } else {
      opposed_db.setChallengeState(challenge.id, Challenge.States.Retesting)
      next_message = require("../../messages/opposed/retesting")
    }

    return interaction
      .ensure("reply", next_message.data(challenge.id), {
        component: "opposed_retest",
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
