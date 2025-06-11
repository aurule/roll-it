const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const accepted_message = require("../../messages/opposed/accepted")

module.exports = {
  name: "opposed_accept",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.tying.accept")
    return new ButtonBuilder()
      .setCustomId("opposed_accept")
      .setLabel(t("text"))
      .setEmoji(t("emoji"))
      .setStyle(ButtonStyle.Secondary)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const current_participant = participants.find(p => p.user_uid == interaction.user.id)

    interaction.authorize(test.trailer.user_uid)

    const chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find(c => c.participant_id === current_participant.id)

    await interaction.deferUpdate()
    opposed_db.setChopTieAccepted(user_chop.id, true)
    if (!user_chop.tie_accepted) {
      const is_attacker = participants.get("attacker").user_uid === interaction.user.id
      const emoji = is_attacker ? "🗡️" : "🛡️"
      interaction.message.react(emoji)
    }

    if (chops.every(c => c.tie_accepted)) {

      // todo update tying message to remove controls

      opposed_db.setChallengeState(challenge.id, ChallengeStates.Accepted)
      return interaction
        .ensure(
          "reply",
          accepted_message.data(challenge.id),
          {
            user_uid: interaction.user.id,
            component: "opposed_accept"
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
    }
  },
}
