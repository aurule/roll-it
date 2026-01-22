import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { OpposedComponent } from "../opposed-component.js"
import { OpTest } from "../../db/opposed/optest.js"
import { makeHistory } from "../../services/opposed/history.js"
import cancelling_message from "../../messages/opposed/cancelling.js"
import winning_message from "../../messages/opposed/winning.js"
import tying_message from "../../messages/opposed/tying.js"

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
    .edit(cancelling_message.inert(test.challenge_id, "withdraw"))
    .catch(() => {
      // suppress all errors so we can send other messages
      return
    })

  let state
  let message
  if (test.leader_id) {
    state = Challenge.States.Winning
    message = winning_message
  } else {
    state = Challenge.States.Tying
    message = tying_message
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
}
