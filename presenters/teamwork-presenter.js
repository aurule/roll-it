const { userMention, time, TimestampStyles, hyperlink, EmbedBuilder } = require("discord.js")
const { oneLine } = require("common-tags")
const { timeout_ms, allowedEmoji } = require("../util/teamwork-settings")
const { messageLink } = require('../util/message-link')

module.exports = {
  helperPromptMessage(userFlake, description) {
    const expiry = new Date(Date.now() + timeout_ms)
    const user_ref = userMention(userFlake)
    const lines = [
       user_ref,
       " is starting a teamwork roll",
    ]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(
      oneLine`
        . If you are assisting them, choose the number of dice you're adding to their pool from the menu. If
        you are adding more than ten dice, choose multiple bonuses. Dice can be added until
        ${user_ref} rolls, or ${time(expiry, TimestampStyles.RelativeTime)}.
      `
    )
    return lines.join("")
  },
  helperRolledMessage(userFlake, description, resultMessage) {
    const lines = [
      userMention(userFlake),
      " led a teamwork roll"
    ]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(
      oneLine`
        . Since the roll has been made, dice may no longer be added. See
        ${hyperlink("the result!", messageLink(resultMessage, false))}
      `
    )
    return lines.join("")
  },
  helperCancelledMessage(userFlake, description) {
    const lines = [
      userMention(userFlake),
      " cancelled a teamwork roll"
    ]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push('.')
    return lines.join("")
  },
  helperTimeoutMessage(userFlake, description) {
    const lines = [
      "The teamwork roll led by ",
      userMention(userFlake),
    ]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(' timed out without a roll. It has been cancelled.')
    return lines.join("")
  },
  leaderPromptMessage(userFlake) {
    const expiry = new Date(Date.now() + timeout_ms)
    const lines = [
      "When your helpers are finished, ",
      userMention(userFlake),
      ", click this button to roll the final pool. The roll will be cancelled ",
      time(expiry, TimestampStyles.RelativeTime),
      "."
    ]
    return lines.join("")
  },
  teamworkSummaryMessage(leaderRollSummary) {
    const lines = [
      leaderRollSummary,
      "This is the result of a teamwork roll. Here's who contributed:"
    ]
    return lines.join("\n")
  },
  contributorEmbed(userFlake, initialPool, bonuses) {
    const embed = new EmbedBuilder()
      .setColor("#03b199")
      .addFields(
        {
          name: "Leader",
          value: `${userMention(userFlake)} with ${initialPool} dice`,
          inline: false
        }
      )

    if (bonuses.size) {
      embed.addFields(
        {
          name: "Helper",
          value: Array.from(bonuses.keys()).map(h => userMention(h)).join("\n"),
          inline: true
        },
        {
          name: "Contribution",
          value: Array.from(bonuses.values()).map(v => `+${v}`).join("\n"),
          inline: true
        },
      )
    }

    return embed
  }
}
