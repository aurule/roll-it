const {
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { makeBreakdown } = require("../../services/opposed/breakdown")
const { makeHistory } = require("../../services/opposed/history")
const { i18n } = require("../../locales")
const winning_message = require("./winning")
const tying_message = require("./tying")

function getLeaderId(chops) {
  if (chops[0].traits == chops[1].traits) {
    return null
  }
  if (chops[0].traits > chops[1].traits) {
    return chops[0].participant_id
  }
  return chops[1].participant_id
}

module.exports = {
  state: "bidding-defender",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallengeWithParticipants(challenge_id)
    const test = opposed_db.getLatestTest(challenge_id)
    const chops = opposed_db.getChopsForTest(test.id)
    const attacker_chop = chops.find((c) => c.participant_id === challenge.attacker.id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.bidding")
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [challenge.defender.user_uid] },
      components: [
        new TextDisplayBuilder({
          content: t("prompt", { participant: challenge.defender.mention }),
        }),
        new TextDisplayBuilder({
          content: t("traits", {
            participant: challenge.attacker.mention,
            count: attacker_chop.traits,
          }),
        }),
      ],
    }
  },
  handleReply(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.reference.messageId)

    const t = i18n.getFixedT(interaction.guild.locale ?? "en-US", "interactive", "opposed")

    interaction.authorize(test.defender.user_uid)

    const traits_content = interaction.content
    const clumped = traits_content.replace(/\s/, "")
    const match = traits_content.match(/\d+/)
    if (match === null) {
      return interaction.whisper(t("bidding.missing")).catch((error) =>
        logger.error(
          {
            err: error,
            challenge,
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
            challenge,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
            content: traits_content,
          },
          "Could not whisper about invalid number",
        ),
      )
    }

    const participants = opposed_db.getParticipants(test.challenge_id, true)
    const chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find((c) => c.participant_id === test.defender.id)

    opposed_db.setChopTraits(user_chop.id, num)
    user_chop.traits = num

    const leader_id = getLeaderId(chops)
    const leader = participants.get(leader_id) ?? null
    const breakdown = makeBreakdown({
      leader,
      chops,
      participants,
      t,
    })

    opposed_db.setTestBreakdown(test.id, breakdown)
    test.breakdown = breakdown
    test.leader_id = leader_id
    const history = makeHistory(test)
    opposed_db.setTestHistory(test.id, history)

    if (leader) {
      opposed_db.setTestLeader(test.id, leader.id)
      opposed_db.setChallengeState(test.challenge_id, ChallengeStates.Winning)

      return interaction
        .ensure("reply", winning_message.data(test.challenge_id), {
          test,
          user_uid: interaction.user.id,
          component: "go_button",
          detail: "Failed to send 'winning' prompt",
        })
        .then((reply_result) => {
          // expect an InteractionCallbackResponse, but deal with a Message too
          const message_uid = reply_result.resource.message.id ?? reply_result.id

          opposed_db.addMessage({
            challenge_id: challenge.id,
            message_uid,
          })
        })
    } else {
      opposed_db.setChallengeState(test.challenge_id, ChallengeStates.Tying)

      return interaction
        .ensure("reply", tying_message.data(test.challenge_id), {
          test,
          user_uid: interaction.user.id,
          component: "go_button",
          detail: "Failed to send 'tying' prompt",
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
  getLeaderId,
}
