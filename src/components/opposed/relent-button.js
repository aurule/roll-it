const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const relented_message = require("../../messages/opposed/relented")

/**
 * Button to allow the attacker to immediately win the challenge
 *
 * Shown on the defender's advantages message.
 */
module.exports = {
  name: "opposed_relent",
  valid_states: ["advantages-defender"],
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_relent")
      .setLabel(
        i18n.t("opposed.advantages-defender.components.relent", { ns: "interactive", lng: locale }),
      )
      .setStyle(ButtonStyle.Secondary),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const defender = participants.get("defender")

    interaction.authorize(defender.user_uid)

    opposed_db.setChallengeState(challenge.id, Challenge.States.Relented)
    return interaction
      .ensure("reply", relented_message.data(challenge.id), {
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
  },
}
