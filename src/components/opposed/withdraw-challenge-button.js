import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { messageData as withdrawnMessage } from "../../messages/opposed/withdrawn.js"
import { OpposedComponent } from "../opposed-component.js"

/**
 * Button for the attacking user to cancel their challenge
 *
 * Shown on the initial attacker advantages and challenge conditions message.
 */
export default new OpposedComponent(
  "opposed_withdraw_challenge",
  data,
  execute,
  Challenge.States.AdvantagesAttacker,
)

export function data(locale) {
  return new ButtonBuilder()
    .setCustomId("opposed_withdraw_challenge")
    .setLabel(
      i18n.t("advantages-attacker.components.withdraw", {
        ns: "opposed",
        lng: locale,
      }),
    )
    .setStyle(ButtonStyle.Secondary)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.findChallengeByMessage(interaction.message.id)

  interaction.authorize(challenge.attacker_uid)

  opposed_db.setChallengeState(challenge.id, Challenge.States.Withdrawn)
  return interaction
    .ensure("reply", withdrawnMessage(challenge.id), {
      component: "opposed_withdraw_challenge",
      challenge_id: challenge.id,
      detail: "Failed to reply with withdrawn message",
    })
    .then((reply_result) => {
      // expect an InteractionCallbackResponse, but deal with a Message too
      const message_uid = reply_result.resource?.message.id ?? reply_result.id

      opposed_db.addMessage({
        challenge_id: challenge.id,
        message_uid,
      })
    })
}
