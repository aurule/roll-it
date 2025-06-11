const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")

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
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    interaction.authorize(participants.map(p => p.user_uid))

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const test = opposed_db.getLatestTestWithParticipants(challenge.id)

    if (!test.retest_reason) {
      return interaction
        .ensure(
          "whisper",
          t("winning.retest.missing"),
          {
            component: "opposed_retest",
            test: test,
            challenge: challenge,
            detail: "failed to whisper about missing retest reason"
          }
        )
    }

    if (test.retester.user_uid !== interaction.user.id) {
      return interaction
        .ensure(
          "whisper",
          t("winning.retest.conflict"),
          {
            component: "opposed_retest",
            test: test,
            challenge: challenge,
            detail: "failed to whisper about conflicted retest"
          }
        )
    }

    const winning_message = require("../../messages/opposed/winning")
    await interaction
      .ensure(
        "edit",
        winning_message.inert(challenge.id),
        {
          component: "opposed_retest",
          test: test,
          challenge: challenge,
          detail: "failed to update progress message to remove controls"
        }
      )
      .catch(error => {
        // suppress all errors so we can send other messages
        return
      })

    opposed_db.setTestRetested(true)
    // todo if the non-retester can cancel, then we move to cancelling state
    //   canceller has cancels advantage
    //   reason is "named" or "ability"

    opposed_db.setChallengeState(challenge.id, ChallengeStates.Cancelling)
    const cancelling_message = require("../../messages/opposed/cancelling")
    return interaction
      .ensure(
        "reply",
        cancelling_message.data(challenge.id),
        {
          component: "opposed_retest",
          test: test,
          challenge: challenge,
          detail: "failed to send cancelling prompt"
        },
      )
      .then((reply_result) => {
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: challenge.id,
          message_uid,
          test_id: test.id,
        })
      })

    // todo if they cannot cancel, we go straight on to Retesting
  },
}
