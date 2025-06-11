const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const withdrawn_message = require("../../messages/opposed/withdrawn")

module.exports = {
  name: "opposed_withdraw_challenge",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_withdraw_challenge")
      .setLabel(i18n.t("opposed.prompt.components.withdraw", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Secondary),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    interaction.authorize(challenge.attacker_uid)

    opposed_db.setChallengeState(challenge.id, ChallengeStates.Withdrawn)
    return interaction
      .ensure(
        "reply",
        withdrawn_message.data(challenge.id),
        {
          component: "opposed_withdraw_challenge",
          challenge_id: challenge.id,
          detail: "Failed to reply with withdrawn message",
        }
      )
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
