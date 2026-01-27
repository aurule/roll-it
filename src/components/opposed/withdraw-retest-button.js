import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { OpposedComponent } from "../opposed-component.js"
import { OpTest } from "../../db/opposed/optest.js"
import { makeHistory } from "../../services/opposed/history.js"
import { inertMessageData as inertCancellingMessage } from "../../messages/opposed/cancelling.js"
import { messageData as winningMessage } from "../../messages/opposed/winning.js"
import { messageData as tyingMessage } from "../../messages/opposed/tying.js"

/**
 * Button to walk back a retest while the other participant has the option to cancel it
 */
export default new OpposedComponent("opposed_withdraw_retest", data, execute, Challenge.States.Cancelling)

export function data(locale) {
  return new ButtonBuilder()
    .setCustomId("opposed_withdraw_retest")
    .setLabel(i18n.t("shared.withdraw", { ns: "opposed", lng: locale }))
    .setStyle(ButtonStyle.Secondary)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(interaction.message.id)

  interaction.authorize(test.retester.user_uid)

  opposed_db.setTestRetested(test.id, false)
  test.retested = false
  opposed_db.setTestHistory(test.id, makeHistory(test))
  if (OpTest.AbilityReasons.has(test.retest_reason)) {
    opposed_db.setParticipantAbilityUsed(test.retester_id, false)
  }

  await interaction.message
    .edit(inertCancellingMessage(test.challenge_id, "withdraw"))
    .catch(() => {
      // suppress all errors so we can send other messages
      return
    })

  let next_state
  let nextMessage
  if (test.leader_id) {
    next_state = Challenge.States.Winning
    nextMessage = winningMessage
  } else {
    next_state = Challenge.States.Tying
    nextMessage = tyingMessage
  }
  opposed_db.setChallengeState(test.challenge_id, next_state)

  return interaction
    .ensure("reply", nextMessage(test.challenge_id), {
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
}
