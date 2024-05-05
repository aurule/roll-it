const { userMention, time, TimestampStyles, hyperlink, EmbedBuilder } = require("discord.js")
const { oneLine } = require("common-tags")
const { timeout_ms, allowedEmoji } = require("../util/teamwork-settings")
const { messageLink } = require('../util/message-link')

module.exports = {
  promptAssisters(userFlake, description) {
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
        . If you are assisting them, react to this message with the number of dice you are adding to their
        pool. If you are adding more than ten dice, add multiple reactions. Dice can be added until
        ${user_ref} rolls, or ${time(expiry, TimestampStyles.RelativeTime)}.
      `
    )
    return lines.join("")
  },
  afterAssisters(userFlake, description, resultMessage) {
    const lines = [
      userMention(userFlake),
      " led a teamwork roll"
    ]
    if (description) {
      lines.push(` for "${description}"`)
    }
    lines.push(
      oneLine`
        . Those who assisted could react to this message to add dice. Since the roll has been made, dice
        may no longer be added. See ${hyperlink("the result!", messageLink(resultMessage, false))}
      `
    )
    return lines.join("")
  },
  showButton(userFlake) {
    const expiry = new Date(Date.now() + timeout_ms)
    const lines = [
      "When your helpers are finished, ",
      userMention(userFlake),
      ", click this button to roll the final pool. The roll will happen automatically ",
      time(expiry, TimestampStyles.RelativeTime),
      "."
    ]
    return lines.join("")
  },
  finalSummary(leaderRollSummary, leaderMessage) {
    const lines = [
      leaderRollSummary,
      oneLine`
        This is the result of a ${hyperlink("teamwork roll", messageLink(leaderMessage, false))}. Here's who
        contributed:
      `,
    ]
    return lines.join("\n")
  },
  async contributorEmbed(userFlake, initialPool, reactions) {
    const userPromises = reactions.map((reaction, emoji) => {
      const bonus = allowedEmoji.indexOf(emoji)
      return reaction.users.fetch()
        .then(users => {
          users.sweep(u => u.bot)
          return {helpers: users.map(u => u.toString()).join("\n"), bonuses: `+${bonus}`.repeat(users.size)}
        })
    })

    return Promise.all(userPromises)
      .then(data => {
        const helpers = data.map(d => d.helpers)
        const bonuses = data.map(d => d.bonuses)
        const embed = new EmbedBuilder()
          .addFields(
            {
              name: "Leader",
              value: `${userMention(userFlake)} with ${initialPool} dice`,
              inline: false
            }
          )
          .setColor("#03b199")
        if (helpers.length) {
          embed.addFields(
            {
              name: "Helper",
              value: helpers.join("\n"),
              inline: true
            },
            {
              name: "Contribution",
              value: bonuses.join("\n"),
              inline: true
            },
          )
        }
        return embed
      })
  }
}
