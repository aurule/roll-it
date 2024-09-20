const {
  userMention,
  time,
  TimestampStyles,
  hyperlink,
  EmbedBuilder,
  inlineCode,
} = require("discord.js")
const { oneLine } = require("common-tags")

const { timeout_ms } = require("../util/teamwork-settings")
const { messageLink } = require("../util/message-link")

module.exports = {
  helperPromptMessage(userFlake, description) {
    const expiry = new Date(Date.now() + timeout_ms)
    const user_ref = userMention(userFlake)
    const lines = [user_ref, " is starting a teamwork roll"]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(
      oneLine`
        . If you are assisting them, choose the number of dice you're adding to their pool from the menu. If
        you are adding more than ten dice, choose multiple bonuses. Dice can be added until
        ${user_ref} rolls, or ${time(expiry, TimestampStyles.RelativeTime)}.
      `,
    )
    return lines.join("")
  },
  helperProgressEmbed(bonuses, requested) {
    const embed = new EmbedBuilder().setColor("#03b199").setTitle("Helpers so far...")

    const iconChooser = (snowflake) => {
      return bonuses.hasAny(snowflake) ? ":white_check_mark:" : ":x:"
    }

    if (requested.length > 0) {
      embed.addFields({
        name: "Requested",
        value: requested.map((user) => `${iconChooser(user)} ${userMention(user)}`).join("\n"),
        inline: false,
      })
    }
    if (bonuses.size) {
      embed.addFields({
        name: "Rolled",
        value: bonuses.map((bonus, user) => `+${bonus} ${userMention(user)}`).join("\n"),
        inline: false,
      })
    }
    return embed
  },
  helperRolledMessage(userFlake, description, resultMessage) {
    const lines = [userMention(userFlake), " led a teamwork roll"]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(
      oneLine`
        . Since the roll has been made, dice may no longer be added. See
        ${hyperlink("the result!", messageLink(resultMessage))}
      `,
    )
    return lines.join("")
  },
  helperCancelledMessage(userFlake, description) {
    const lines = [userMention(userFlake), " cancelled a teamwork roll"]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(".")
    return lines.join("")
  },
  helperTimeoutMessage(userFlake, description) {
    const lines = ["The teamwork roll led by ", userMention(userFlake)]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(" timed out without a roll. It has been cancelled.")
    return lines.join("")
  },
  leaderPromptMessage(userFlake) {
    const expiry = new Date(Date.now() + timeout_ms)
    const lines = [
      "When your helpers are finished, ",
      userMention(userFlake),
      ", click ",
      inlineCode("Roll It!"),
      " to roll the final pool. The roll will happen automatically ",
      time(expiry, TimestampStyles.RelativeTime),
      ". If there are a few specific people whose help you need, select them here to notify them.",
    ]
    return lines.join("")
  },
  teamworkSummaryMessage(leaderRollSummary, promptMessage) {
    const lines = [
      leaderRollSummary,
      oneLine`
        This is the result of a
        ${hyperlink("teamwork roll", messageLink(promptMessage))}.
        Here's who contributed:
      `,
    ]
    return lines.join("\n")
  },
  contributorEmbed(userFlake, initialPool, bonuses) {
    const embed = new EmbedBuilder().setColor("#03b199").addFields({
      name: "Leader",
      value: `${userMention(userFlake)} with ${initialPool} dice`,
      inline: false,
    })

    if (bonuses.size) {
      embed.addFields({
        name: "Helper",
        value: bonuses.map((bonus, user) => `+${bonus} ${userMention(user)}`).join("\n"),
        inline: false,
      })
    }

    return embed
  },
}
