const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const relented_message = require("../../messages/opposed/relented")

module.exports = {
  name: "opposed_relent",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_relent")
      .setLabel(i18n.t("opposed.prompt.components.relent", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Secondary),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (false) {
    // if (interaction.user.id !== defender.user_uid) {
      return interaction
        .ensure(
          "whisper",
          t("unauthorized", { participants: [defender.mention] }),
          {
            user: interaction.user.id,
            component: "opposed_relent",
            challenge_id: challenge.id,
            detail: `Failed to whisper about unauthorized usage from ${interaction.user.id}`,
          }
        )
    }

    opposed_db.setChallengeState(challenge.id, ChallengeStates.Relented)
    return interaction
      .ensure(
        "reply",
        relented_message.data(challenge.id),
        {
          component: "opposed_relent",
          challenge_id: challenge.id,
          detail: "Failed to reply with relented message",
        }
      )
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id: challenge.id,
          message_uid,
        })
      })
  },
}
