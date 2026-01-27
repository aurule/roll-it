import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { messageData as throwingMessage } from "../../messages/opposed/throwing.js"
import { OpposedComponent } from "../opposed-component.js"
import { messageData as inertCancellingMessage } from "../../messages/opposed/cancelling.js"

/**
 * Button to continue a retest when participant has the option to cancel
 */
export default new OpposedComponent("opposed_continue", data, execute, Challenge.States.Cancelling)

export function data(locale) {
  const t = i18n.getFixedT(locale, "opposed", "cancelling.components.continue")
  return new ButtonBuilder()
    .setCustomId("opposed_continue")
    .setLabel(t("text"))
    .setStyle(ButtonStyle.Primary)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(interaction.message.id)

  interaction.authorize(test.canceller.user_uid)

  await interaction.message.edit(inertCancellingMessage(test.challenge_id)).catch(() => {
    // suppress all errors so we can send other messages
    return
  })

  const next_test_id = opposed_db.addTest({
    challenge_id: test.challenge_id,
    locale: test.locale,
  }).lastInsertRowid
  opposed_db.setChallengeState(test.challenge_id, Challenge.States.Throwing)

  return interaction
    .ensure("reply", throwingMessage(test.challenge_id), {
      component: "opposed_continue",
      test: test,
      detail: "failed to send throwing prompt",
    })
    .then((reply_result) => {
      const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

      opposed_db.addMessage({
        challenge_id: test.challenge_id,
        message_uid,
        test_id: next_test_id,
      })
    })
}
