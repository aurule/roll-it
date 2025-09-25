const { ButtonBuilder, ButtonStyle, MessageFlags, TextDisplayBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { handleRequest } = require("../../services/met-roller")
const { makeBreakdown } = require("../../services/opposed/breakdown")
const { makeHistory } = require("../../services/opposed/history")
const winning_message = require("../../messages/opposed/winning")
const bidding_atk_message = require("../../messages/opposed/bidding-attacker")
const { textMessage } = require("../../util/message-builders")

const BEATS = new Map([
  ["rock", ["scissors"]],
  ["paper", ["rock"]],
  ["bomb", ["rock", "paper"]],
  ["scissors", ["paper", "bomb"]],
])

/**
 * Determine the leading participant
 * @param  {Chop[]}           chops        Array of two chop records
 * @param  {Participant[]}    participants Array of participant records
 * @param  {int}              challenge_id Internal ID of the related challenge
 * @return {Participant|null}              Winning participant record, or null
 */
function chooseLeader(chops, participants, challenge_id) {
  if (chops[0].result === chops[1].result) {
    const opposed_db = new Opposed()
    return opposed_db.getTieWinner(challenge_id)
  }

  const beaten = BEATS.get(chops[0].result)
  if (beaten.includes(chops[1].result)) {
    return participants.find((p) => p.id == chops[0].participant_id)
  } else {
    return participants.find((p) => p.id == chops[1].participant_id)
  }
}

/**
 * Resolve the chops and handle their aftermath
 *
 * With a winner, the challenge is updated with new leader, breakdown, history. With a tie, the bidding phase begins.
 *
 * @param  {object} options
 * @param  {Interaction} options.interaction    Discord Interaction objecct
 * @param  {Chop[]} options.chops               Array of chops for the test
 * @param  {Participant[]} options.participants Array of participants in the test
 * @param  {OpTest} options.test                Test record
 * @return {Reply}                              Interaction reply result
 */
async function resolveChops({ interaction, chops, participants, test }) {

  const opposed_db = new Opposed()
  const t = i18n.getFixedT(test.locale, "interactive", "opposed")

  for (const chop of chops) {
    const result = handleRequest(chop.request, 1)
    chop.result = result[0]
    opposed_db.setChopResult(chop.id, result[0])
  }

  const leader = chooseLeader(chops, participants, test.challenge_id)
  const breakdown = makeBreakdown({ leader, chops, participants, t })

  const result_args = {
    leader: leader?.mention,
    breakdown,
    context: leader ? "leader" : "tied",
  }
  await interaction
    .ensure(
      "edit",
      textMessage(t("throws.result", result_args), { allowedMentions: { parse: [] } }),
      {
        test,
        user_uid: interaction.user.id,
        component: "go_button",
        detail: "Failed to edit throw prompt to show result",
      },
    )
    .catch(() => {
      // suppress all other errors so we can try to send something else
      return
    })

  if (leader) {
    opposed_db.setTestLeader(test.id, leader.id)
    test.leader_id = leader.id
    opposed_db.setTestBreakdown(test.id, breakdown)
    test.breakdown = breakdown
    const history = makeHistory(test)
    opposed_db.setTestHistory(test.id, history)
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.Winning)

    return interaction
      .ensure("reply", winning_message.data(test.challenge_id), {
        test,
        user_uid: interaction.user.id,
        component: "go_button",
        detail: "Failed to send 'winning' prompt",
      })
      .then((reply_result) => {
        const message_uid = reply_result.id

        opposed_db.addMessage({
          challenge_id: test.challenge_id,
          message_uid,
          test_id: test.id,
        })
      })
  } else {
    opposed_db.setChallengeState(test.challenge_id, Challenge.States.BiddingAttacker)
    return interaction
      .ensure("reply", bidding_atk_message.data(test.challenge_id), {
        test,
        user_uid: interaction.user.id,
        component: "go_button",
        detail: "Failed to send 'bidding_attacker' prompt",
      })
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

/**
 * Button to commit to throwing a given chop
 */
module.exports = {
  name: "go_button",
  valid_states: ["throwing"],
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("go_button")
      .setLabel(i18n.t("opposed.throws.components.go", { ns: "interactive", lng: locale }))
      .setEmoji("1303828291492515932")
      .setStyle(ButtonStyle.Success),
  async execute(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(test.challenge_id)
    const current_participant = participants.find((p) => p.user_uid == interaction.user.id)

    interaction.authorize(...participants.map((p) => p.user_uid))

    const t = i18n.getFixedT(test.locale, "interactive", "opposed")

    let chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find((c) => c.participant_id === current_participant.id)
    if (user_chop === undefined) {
      return interaction.ensure("whisper", t("throws.premature"), {
        test,
        user_uid: interaction.user.id,
        component: "go_button",
        detail: "Whispering about premature go click",
      })
    }

    opposed_db.setChopReady(user_chop.id, true)
    if (!user_chop.ready) {
      const is_attacker = participants.get("attacker").user_uid === interaction.user.id
      const emoji = is_attacker ? "🗡️" : "🛡️"
      interaction.message.react(emoji)
    }

    chops = opposed_db.getChopsForTest(test.id)
    if (chops.length > 1 && chops.every((c) => c.ready)) {
      return resolveChops({ interaction, chops, participants, test })
    }
  },
  chooseLeader,
  resolveChops,
}
