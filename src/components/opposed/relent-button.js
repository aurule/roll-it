import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { messageData as relentedMessage } from "../../messages/opposed/relented.js"
import { OpposedComponent } from "../opposed-component.js"

/**
 * Button to allow the attacker to immediately win the challenge
 *
 * Shown on the defender's advantages message.
 */
export default new OpposedComponent(
  "opposed_relent",
  data,
  execute,
  Challenge.States.AdvantagesDefender,
)

export function data(locale) {
  return new ButtonBuilder()
    .setCustomId("opposed_relent")
    .setLabel(i18n.t("advantages-defender.components.relent", { ns: "opposed", lng: locale }))
    .setStyle(ButtonStyle.Secondary)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
  const participants = opposed_db.getParticipants(challenge.id)
  const defender = participants.get("defender")

  interaction.authorize(defender.user_uid)

  opposed_db.setChallengeState(challenge.id, Challenge.States.Relented)
  return interaction
    .ensure("reply", relentedMessage(challenge.id), {
      component: "opposed_relent",
      challenge_id: challenge.id,
      detail: "Failed to reply with relented message",
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
