const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { i18n } = require("../../locales")
const bidding_defender_message = require("./bidding-defender")
const build = require("../../util/message-builders")
const { extractNumber } = require("../../util/extract-number")

/**
 * Message shown to gather the attacking participant's trait bid during a tied test
 */
module.exports = {
  state: "bidding-attacker",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.bidding")
    return build.textMessage(t("prompt", { participant: participants.get("attacker").mention }), {
      withResponse: true,
    })
  },
  handleReply(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.reference.messageId)

    const t = i18n.getFixedT(interaction.guild.locale ?? "en-US", "interactive", "opposed")

    interaction.authorize(test.attacker.user_uid)

    const matched_number = extractNumber(interaction.content)
    if (matched_number === undefined) {
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

    if (matched_number === NaN) {
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

    const chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find((c) => c.participant_id === test.attacker.id)

    opposed_db.setChopTraits(user_chop.id, matched_number)
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.BiddingDefender)
    return interaction
      .ensure("reply", bidding_defender_message.data(test.challenge_id), {
        test,
        attacker: test.attacker,
        user_chop,
        traits: matched_number,
        detail: "Failed to send defender bid prompt",
      })
      .then((reply_result) => {
        const message_uid = reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
          test_id: test.id,
        })
      })
  },
}
