const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const conceded_message = require("../../messages/opposed/conceded")

module.exports = {
  name: "opposed_concede",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "interactive", "opposed.winning.concede")
    return new ButtonBuilder()
      .setCustomId("opposed_concede")
      .setLabel(t("text"))
      .setEmoji(t("emoji"))
      .setStyle(ButtonStyle.Secondary)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const test = opposed_db.getLatestTestWithParticipants(challenge.id)

    interaction.authorize(test.trailer.user_uid)

    // todo update winning message to remove controls

    opposed_db.setChallengeState(challenge.id, ChallengeStates.Conceded)
    return interaction
      .ensure(
        "reply",
        conceded_message.data(challenge.id),
        {
          user_uid: interaction.user.id,
          component: "opposed_concede"
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
