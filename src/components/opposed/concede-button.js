import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { messageData as concededMessage } from "../../messages/opposed/conceded.js"
import { OpposedComponent } from "../opposed-component.js"

/**
 * Button to concede to the winning participant
 */
export default new OpposedComponent("opposed_concede", data, execute, Challenge.States.Winning)

export function data(locale) {
  const t = i18n.getFixedT(locale, "opposed", "winning.concede")
  return new ButtonBuilder()
    .setCustomId("opposed_concede")
    .setLabel(t("text"))
    .setEmoji(t("emoji"))
    .setStyle(ButtonStyle.Secondary)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
  const test = opposed_db.getLatestTest(challenge.id)

  interaction.authorize(test.trailer.user_uid)

  await interaction.message.delete().catch(() => {
    // suppress all errors so we can send other messages
    return
  })

  opposed_db.setChallengeState(challenge.id, Challenge.States.Conceded)
  return interaction
    .ensure("reply", concededMessage(challenge.id), {
      user_uid: interaction.user.id,
      component: "opposed_concede",
    })
    .then((reply_result) => {
      // expect an InteractionCallbackResponse, but deal with a Message too
      const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

      opposed_db.addMessage({
        challenge_id: challenge.id,
        message_uid,
      })
    })
}
