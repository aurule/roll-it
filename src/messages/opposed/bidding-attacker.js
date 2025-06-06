const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { i18n } = require("../../locales")
const bidding_defender_message = require("./bidding-defender")

module.exports = {
  state: "bidding-attacker",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.bidding")
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t("prompt", { participant: participants.get("attacker").mention }),
        }),
      ],
    }
  },
  handleReply(interaction) {
    const traits_content = interaction.content
    const clumped = traits_content.replace(/\s/, "")
    const match = traits_content.match(/\d+/)
    if (match === null) {
      return interaction.whisper(t("bidding.missing")).catch((error) =>
        logger.error(
          {
            err: error,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
            content: traits_content,
          },
          "Could not whisper about missing number",
        ),
      )
    }

    const num = parseInt(match[0])
    if (num === NaN) {
      return interaction.whisper(t("bidding.invalid")).catch((error) =>
        logger.error(
          {
            err: error,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
            content: traits_content,
          },
          "Could not whisper about invalid number",
        ),
      )
    }

    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.reference.messageId)
    const participants = opposed_db.getParticipants(test.challenge_id)
    const chops = opposed_db.getChopsForTest(test.id)
    // todo only allow attacker to reply
    const current_participant = participants.find(p => p.user_uid == interaction.author.id)
    const user_chop = chops.find(c => c.participant_id === current_participant.id)

    opposed_db.setChopTraits(user_chop.id, num)
    opposed_db.setChallengeState(test.challenge_id, ChallengeStates.BiddingDefender)
    return interaction
      .ensure(
        "reply",
        bidding_defender_message.data(test.challenge_id),
        {
          test,
          current_participant,
          user_chop,
          traits: num,
          detail: "Failed to send defender bid prompt",
        }
      )
      .then((reply_result) => {
        const message_uid = reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
          test_id: test.id,
        })
      })
  }
}
