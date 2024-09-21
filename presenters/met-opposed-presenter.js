const { time, TimestampStyles, subtext, hyperlink, orderedList, bold } = require("discord.js")
const { oneLine } = require("common-tags")

function advantages(participant) {
  if (participant.bomb && participant.ties) return ` ${participant.mention} has bomb and ties.`
  else if (participant.bomb) return ` ${participant.mention} has bomb.`
  else if (participant.ties) return ` ${participant.mention} has ties.`
  return ""
}

function initialMessage(manager, error) {
  let content = `${manager.attacker.mention} is challenging you, ${manager.defender.mention} with a ${manager.attribute} test`
  if (manager.description) content += ` for "${manager.description}"`
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
    ${manager.attacker.mention} is challenging ${manager.defender.mention} with a ${manager.attribute} test
  `
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  content += advantages(manager.attacker)
  content += advantages(manager.defender)
  return content
}

function relentMessage(manager) {
  let content = oneLine`
    ${manager.defender.mention} relented to the opposed test from ${manager.attacker.mention}.
  `
  return content
}

function cancelMessage(manager) {
  let content = oneLine`
    ${manager.attacker.mention} cancelled their opposed test against ${manager.defender.mention}.
  `
  return content
}

function timeoutRelentMessage(manager) {
  let content = oneLine`
    ${manager.defender.mention} did not respond to the opposed test from ${manager.attacker.mention}.
  `
  return content
}

function statusPrompt(manager) {
  let lines = [
    initialMessageSummary(manager) + ` The named retest is ${manager.retest_ability}.`,
    orderedList(manager.test_recorder.tests.map(test => test.present())),
    subtext(`Without a retest, the challenge will end ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)}.`)
  ]
  return lines.join("\n")
}

function statusSummary(manager) {
  let lines = [
    initialMessageSummary(manager) + `The named retest is ${manager.retest_ability}.`,
    orderedList(manager.test_recorder.tests.map(test => test.present())),
  ]
  return lines.join("\n")
}

function resultMessage(manager) {
  const leader = manager.current_test.leader
  let content
  if (leader) {
    content = `${leader.mention} ${bold("won")}`
  } else {
    content = `${manager.attacker.mention} and ${manager.defender.mention} ${bold("tied")}`
  }
  content += ` the ${hyperlink("opposed test", manager.last_message_link)}`
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  return content
}

module.exports = {
  advantages,
  initialMessage,
  initialMessageSummary,
  relentMessage,
  cancelMessage,
  timeoutRelentMessage,
  statusPrompt,
  statusSummary,
  resultMessage,
}
