const { ButtonBuilder, ButtonStyle, MessageFlags, TextDisplayBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed, ChallengeStates } = require("../../db/opposed")
const { logger } = require("../../util/logger")
const { handleRequest } = require("../../services/met-roller")
const winning_message = require("../../messages/opposed/winning")
const bidding_message = require("../../messages/opposed/bidding")

const BEATS = new Map([
  ["rock", ["scissors"]],
  ["paper", ["rock"]],
  ["bomb", ["rock", "paper"]],
  ["scissors", ["paper", "bomb"]],
])

function chooseLeader(chops, participants, challenge_id) {
  if (chops[0].result === chops[1].result) {
    const opposed_db = new Opposed()
    return opposed_db.getTieWinner(challenge_id)
  }

  const beaten = BEATS.get(chops[0].result)
  if (beaten.includes(chops[1].result)) {
    return participants.find(p => p.id == chops[0].participant_id)
  } else {
    return participants.find(p => p.id == chops[1].participant_id)
  }
}

function makeBreakdown({leader, chops, participants, t}) {
  if (leader === null) {
    return t("shared.breakdown.tied", { result: chops[0].result })
  }

  if (chops[0].result === chops[1].result) {
    return t("shared.breakdown.tiebreaker", { result: chops[0].result, leader: leader.mention })
  }

  const leader_chop = chops.find(c => c.participant_id === leader.id)
  const trailer = participants.find(p => p.user_uid !== leader.user_uid)
  const trailer_chop = chops.find(c => c.participant_id === trailer.id)

  const t_args = {
    leader_result: leader_chop.result,
    trailer: trailer.mention,
    trailer_result: trailer_chop.result,
  }
  return t("shared.breakdown.winner", t_args)
}

function makeHistory(test) {
  const t = i18n.getFixedT(test.locale, "interactive", "opposed.shared.history")

  const opposed_db = new Opposed()
  const leader = opposed_db.getParticipant(test.leader_id)
  const outcome_args = {
    leader: leader.mention,
    context: leader ? "leader" : "tied",
    breakdown: test.breakdown,
  }
  const lines = [
    `1. ${t("leader", outcome_args)}`
  ]
  if (test.retester_id) {
    const retester = opposed_db.getParticipant(test.retester_id)
    lines.push(t("retest", { retester: retester.mention, reason: test.retest_reason }))
  }
  if (test.canceller_id) {
    const canceller = opposed_db.getParticipant(test.canceller_id)
    lines.push(t("cancelled", { canceller: canceller.mention, reason: test.cancelled_with }))
  }
  return lines.join("\n\t- ")
}

function resolveChops(chops, participants, test) {
  const t = i18n.getFixedT(test.locale, "interactive", "opposed")

  for (const chop of chops) {
    const result = handleRequest(chop.request, 1)
    chop.result = result[0]
    opposed_db.setChopResult(chop.id, result[0])
  }

  const leader = chooseLeader(chops, participants, test.challenge_id)
  const breakdown = makeBreakdown({leader, chops, participants, t})

  if (leader) {
    opposed_db.setTestLeader(test.id, leader.id)
    opposed_db.setTestBreakdown(test.id, breakdown)
    const history = makeHistory(test, breakdown)
    opposed_db.setTestHistory(test.id, history)
    opposed_db.setChallengeState(test.challenge_id, ChallengeStates.Winning)

    const result_args = {
      leader: leader?.mention,
      breakdown,
      context: leader ? "leader" : "tied"
    }
    return interaction
      .editReply({
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
        components: [
          new TextDisplayBuilder({
            content: t("throws.result", result_args)
          })
        ],
      })
      .catch((error) =>
        logger.warn(
          { test, err: error, user: interaction.user.id, component: "go_button", participant_id },
          `Could not edit throw prompt with results`,
        )
      )
      .then(() => {
        interaction
          .followUp(winning_message.data(challenge_id))
          .catch((error) =>
            logger.warn(
              { test, err: error, user: interaction.user.id, component: "go_button", participant_id },
              `Could not send summary message`,
            )
          )
      })
  } else {
    opposed_db.setChallengeState(test.challenge_id, ChallengeStates.Bidding)
    return interaction
      .editReply({
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
        components: [
          new TextDisplayBuilder({
            content: t("throws.bidding", { breakdown })
          })
        ],
      })
      .catch((error) =>
        logger.warn(
          { test, err: error, user: interaction.user.id, component: "go_button", participant_id },
          `Could not edit throw prompt with status`,
        )
      )
      .then(() => {
        interaction
          .followUp(bidding_message.data(challenge_id))
          .catch((error) =>
            logger.warn(
              { test, err: error, user: interaction.user.id, component: "go_button", participant_id },
              `Could not send bidding message`,
            )
          )
      })
  }
}

module.exports = {
  name: "go_button",
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
    const current_participant = participants.find(p => p.user_uid == interaction.user.id)

    const t = i18n.getFixedT(test.locale, "interactive", "opposed")

    if (!participants.some(p => p.user_uid === interaction.user.id)) {
      return interaction
        .whisper(t("unauthorized"))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "go_button", participant_id },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          )
        )
    }

    if (test.done) {
      return interaction
        .whisper(t("throws.done", { outcome: test.outcome }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "go_button", participant_id },
            `Could not whisper about a finished test from ${interaction.user.id}`,
          )
        )
    }

    let chops = opposed_db.getChopsForTest(test.id)
    const user_chop = chops.find(c => c.participant_id === current_participant.id)
    if (user_chop === undefined) {
      return interaction
        .whisper(t("throws.premature"))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "go_button", participant_id },
            `Could not whisper about premature go from ${interaction.user.id}`,
          )
        )
    }

    await interaction.deferUpdate()

    const ready_result = opposed_db.setChopReady(user_chop.id, true)
    user_chop.ready = true
    if (ready_result.changes > 0) {
      const is_attacker = participants.get("attacker").user_uid === interaction.user.id
      const emoji = is_attacker ? "🗡️" : "🛡️"
      interaction.message.react(emoji)
    }

    if (chops.length > 1 && chops.every(c => c.ready)) {
      return resolveChops(chops, participants, test)
    }
  }
}
