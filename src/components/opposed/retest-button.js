import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { Participant } from "../../db/opposed/participant.js"
import { makeHistory } from "../../services/opposed/history.js"
import { OpposedComponent } from "../opposed-component.js"
import { inertMessageData as innertWinningMessage } from "../../messages/opposed/winning.js"
import { inertMessageData as innertTyingMessage } from "../../messages/opposed/tying.js"
import { messageData as cancellingMessage } from "../../messages/opposed/cancelling.js"
import { messageData as throwingMessage } from "../../messages/opposed/throwing.js"

const abilityReasons = new Set(["named", "ability"])

/**
 * Determine whether the test's canceller is able to cancel
 * @param  {OpTest}  test The test being retested
 * @return {boolean}      True if the canceller can cancel, false if not
 */
export function canCancel(test) {
  return (
    test.canceller.advantages.includes(Participant.Advantages.Cancels) ||
    (abilityReasons.has(test.retest_reason) && !test.canceller.ability_used)
  )
}

/**
 * Button to retest a resolved test
 */
export default new OpposedComponent(
  "opposed_retest",
  data,
  execute,
  Challenge.States.Winning,
  Challenge.States.Tying,
)

export function data(locale) {
  const t = i18n.getFixedT(locale, "opposed", "shared.retest.button")
  return new ButtonBuilder()
    .setCustomId("opposed_retest")
    .setLabel(t("text"))
    .setEmoji(t("emoji"))
    .setStyle(ButtonStyle.Secondary)
}

export async function execute(interaction) {
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

  const inertPrompt =
    challenge.state === Challenge.States.Winning ? innertWinningMessage : innertTyingMessage

  await interaction.message.edit(inertPrompt(challenge.id)).catch(() => {
    // suppress all errors so we can send other messages
    return
  })

  opposed_db.setTestRetested(test.id)
  test.retested = true
  opposed_db.setTestHistory(test.id, makeHistory(test))
  if (abilityReasons.has(test.retest_reason)) {
    opposed_db.setParticipantAbilityUsed(test.retester_id)
  }

  if (canCancel(test)) {
    opposed_db.setChallengeState(challenge.id, Challenge.States.Cancelling)
    if (!test.canceller.advantages.includes("cancels")) {
      opposed_db.setTestCancelledWith(test.id, "ability")
    }
    return interaction
      .ensure("reply", cancellingMessage(challenge.id), {
        component: "opposed_retest",
        test: test,
        challenge: challenge,
        detail: `failed to send cancelling prompt`,
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

    const next_test_id = opposed_db.addTest({
      challenge_id: test.challenge_id,
      locale: test.locale,
    }).lastInsertRowid
    return interaction
      .ensure("reply", throwingMessage(challenge.id), {
        component: "opposed_retest",
        test: test,
        challenge: challenge,
        detail: `failed to send throwing prompt`,
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
}
