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
  valid_states: ["tying"],
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
    const test = opposed_db.getLatestTest(challenge.id)
    const participants = opposed_db.getParticipants(challenge.id)
    const current_participant = participants.find((p) => p.user_uid == interaction.user.id)

    interaction.authorize(...participants.map((p) => p.user_uid))

    const chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find((c) => c.participant_id === current_participant.id)
    const other_chop = chops.find((c) => c.participant_id !== current_participant.id)

    await interaction.deferUpdate()
    opposed_db.setChopTieAccepted(user_chop.id, true)
    if (!user_chop.tie_accepted) {
      const emoji = test.attacker.user_uid === interaction.user.id ? "🗡️" : "🛡️"
      interaction.message.react(emoji)
    }
    user_chop.tie_accepted = true

    if (user_chop.tie_accepted && other_chop.tie_accepted) {
      const tying_message = require("../../messages/opposed/tying")
      await interaction.message
        .edit(tying_message.inert(challenge.id))
        .catch(() => {
          // suppress all errors so we can send other messages
          return
        })

      opposed_db.setChallengeState(challenge.id, Challenge.States.Accepted)
      return interaction
        .ensure("followUp", accepted_message.data(challenge.id), {
          user_uid: interaction.user.id,
          component: "opposed_accept",
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
  },
}
