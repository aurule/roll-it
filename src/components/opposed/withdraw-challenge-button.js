const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const withdrawn_message = require("../../messages/opposed/withdrawn")

/**
 * Button for the attacking user to cancel their challenge
 *
 * Shown on the initial attacker advantages and challenge conditions message.
 */
module.exports = {
  name: "opposed_withdraw_challenge",
  valid_states: ["advantages-attacker"],
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_withdraw_challenge")
      .setLabel(i18n.t("opposed.advantages-attacker.components.withdraw", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Secondary),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)

    interaction.authorize(challenge.attacker_uid)

    opposed_db.setChallengeState(challenge.id, Challenge.States.Withdrawn)
    return interaction
      .ensure("reply", withdrawn_message.data(challenge.id), {
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
  },
}
