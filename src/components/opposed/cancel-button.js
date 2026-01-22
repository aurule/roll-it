import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { makeHistory } from "../../services/opposed/history.js"
import { OpTest } from "../../db/opposed/optest.js"
import { OpposedComponent } from "../opposed-component.js"
import cancelling_message from "../../messages/opposed/cancelling.js"
import winning_message from "../../messages/opposed/winning.js"
import tying_message from "../../messages/opposed/tying.js"

/**
 * Button shown when a retest can be cancelled
 */
export default new OpposedComponent("opposed_cancel", data, execute, Challenge.States.Cancelling)

export function data(locale) {
  const t = i18n.getFixedT(locale, "opposed", "cancelling.components.cancel")
  return new ButtonBuilder()
    .setCustomId("opposed_cancel")
    .setLabel(t("text"))
    .setStyle(ButtonStyle.Danger)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(interaction.message.id)

  interaction.authorize(test.canceller.user_uid)

  if (!test.cancelled_with) {
    return interaction.ensure(
      "whisper",
      i18n.t("cancelling.missing", { lng: test.locale, ns: "opposed" }),
      {
        component: "opposed_cancel",
        test: test,
        detail: "failed to whisper about missing cancel reason ",
      },
    )
  }

  opposed_db.setTestCancelled(test.id)
  test.cancelled = true
  opposed_db.setTestHistory(test.id, makeHistory(test))
  if (test.cancelled_with === OpTest.CancelReasons.Ability) {
    opposed_db.setParticipantAbilityUsed(test.canceller.id)
  }

  await interaction.message
    .edit(cancelling_message.inert(test.challenge_id, "cancel"))
    .catch((_error) => {
      // suppress all errors so we can send other messages
      return
    })

  let next_message
  if (test.leader) {
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.Winning)
    next_message = winning_message
  } else {
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.Tying)
    next_message = tying_message
  }

  return interaction
    .ensure("reply", next_message.data(test.challenge_id), {
      component: "opposed_cancel",
      test: test,
      detail: `failed to send ${next_message.state} prompt`,
    })
    .then((reply_result) => {
      const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

      opposed_db.addMessage({
        challenge_id: test.challenge_id,
        message_uid,
        test_id: test.id,
      })
    })
}
