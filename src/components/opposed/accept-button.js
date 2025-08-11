const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const accepted_message = require("../../messages/opposed/accepted")

/**
 * Button to accept a tied outcome
 */
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
    const test = opposed_db.getLatestTestWithParticipants(challenge.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const current_participant = participants.find((p) => p.user_uid == interaction.user.id)

    interaction.authorize(...participants)

    const chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find((c) => c.participant_id === current_participant.id)

    await interaction.deferUpdate()
    opposed_db.setChopTieAccepted(user_chop.id, true)
    if (!user_chop.tie_accepted) {
      const emoji = test.attacker.user_uid === interaction.user.id ? "🗡️" : "🛡️"
      interaction.message.react(emoji)
    }

    if (chops.every((c) => c.tie_accepted)) {
      const tying_message = require("../../messages/opposed/tying")
      await interaction
        .ensure("edit", tying_message.inert(challenge.id), {
          component: "opposed_retest",
          test: test,
          challenge: challenge,
          detail: "failed to update tying message to remove controls",
        })
        .catch(() => {
          // suppress all errors so we can send other messages
          return
        })

      opposed_db.setChallengeState(challenge.id, Challenge.States.Accepted)
      return interaction
        .ensure("reply", accepted_message.data(challenge.id), {
          user_uid: interaction.user.id,
          component: "opposed_accept",
        })
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
