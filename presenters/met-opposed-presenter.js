const { time, TimestampStyles, subtext, hyperlink } = require("discord.js")
const { oneLine } = require("common-tags")

function advantages(participant) {
  if (participant.bomb && participant.ties) return ` ${participant.mention} has bomb and ties.`
  else if (participant.bomb) return ` ${participant.mention} has bomb.`
  else if (participant.ties) return ` ${participant.mention} has ties.`
  return ""
}

function initialMessage(manager, error) {
  let content = `${manager.attacker.mention} is targeting you, ${manager.defender.mention} with a ${manager.attribute} test`
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  content += advantages(manager.attacker)
  content += "\n"
  content += oneLine`
    If you don't respond ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)}, the challenge will
    end and ${manager.attacker.mention} will likely succeed.
  `
  if (error) content += `\n${subtext(error)}`
  return content
}

function initialMessageSummary(manager) {
  let content = oneLine`
    ${manager.attacker.mention} targeted ${manager.defender.mention} with a ${manager.attribute} test
  `
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  content += advantages(manager.attacker)
  content += advantages(manager.defender)
  return content
}

function relentMessage(manager) {
  let content = oneLine`
    ${manager.defender.mention} relented to the ${hyperlink("opposed test", manager.last_message_link)} from
    ${manager.attacker.mention}.
  `
  return content
}

function cancelMessage(manager) {
  let content = oneLine`
    ${manager.attacker.mention} cancelled their ${hyperlink("opposed test", manager.last_message_link)}
    against ${manager.defender.mention}.
  `
  return content
}

function timeoutRelentMessage(manager) {
  let content = oneLine`
    ${manager.defender.mention} did not respond to the ${hyperlink("opposed test", manager.last_message_link)}
    from ${manager.attacker.mention}.
  `
  return content
}

module.exports = {
  advantages,
  initialMessage,
  initialMessageSummary,
  relentMessage,
}
