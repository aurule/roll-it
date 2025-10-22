const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { Participant } = require("../../db/opposed/participant")
const { makeHistory } = require("../../services/opposed/history")

const AbilityReasons = new Set(["named", "ability"])

/**
 * Determine whether the test's canceller is able to cancel
 * @param  {OpTest}  test The test being retested
 * @return {boolean}      True if the canceller can cancel, false if not
 */
function canCancel(test) {
  return (
    test.canceller.advantages.includes(Participant.Advantages.Cancels) ||
    (AbilityReasons.has(test.retest_reason) && !test.canceller.ability_used)
  )
}

/**
 * Button to retest a resolved test
 */
module.exports = {
  name: "opposed_retest",
  valid_states: ["winning", "tying"],
  data: (locale) => {
    const t = i18n.getFixedT(locale, "opposed", "shared.retest.button")
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

    interaction.authorize(...participants.map((p) => p.user_uid))

    const t = i18n.getFixedT(challenge.locale, "opposed")

    const test = opposed_db.getLatestTest(challenge.id)

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

    await interaction.message.edit(message.inert(challenge.id)).catch(() => {
      // suppress all errors so we can send other messages
      return
    })

    opposed_db.setTestRetested(test.id)
    test.retested = true
    opposed_db.setTestHistory(test.id, makeHistory(test))
    if (AbilityReasons.has(test.retest_reason)) {
      opposed_db.setParticipantAbilityUsed(test.retester_id)
    }

    if (canCancel(test)) {
      opposed_db.setChallengeState(challenge.id, Challenge.States.Cancelling)
      if (!test.canceller.advantages.includes("cancels")) {
        opposed_db.setTestCancelledWith(test.id, "ability")
      }
      const next_message = require("../../messages/opposed/cancelling")
      return interaction
        .ensure("reply", next_message.data(challenge.id), {
          component: "opposed_retest",
          test: test,
          challenge: challenge,
          detail: `failed to send ${next_message.state} prompt`,
        })
        .then((reply_result) => {
          const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

          opposed_db.addMessage({
            challenge_id: challenge.id,
            message_uid,
            test_id: test.id,
          })
        })
    } else {
      opposed_db.setChallengeState(challenge.id, Challenge.States.Throwing)

      const next_message = require("../../messages/opposed/throwing")
      const next_test_id = opposed_db.addTest({
        challenge_id: test.challenge_id,
        locale: test.locale,
      }).lastInsertRowid
      return interaction
        .ensure("reply", next_message.data(challenge.id), {
          component: "opposed_retest",
          test: test,
          challenge: challenge,
          detail: `failed to send ${next_message.state} prompt`,
        })
        .then((reply_result) => {
          const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

          opposed_db.addMessage({
            challenge_id: challenge.id,
            message_uid,
            test_id: next_test_id,
          })
        })
    }
  },
  canCancel,
}
