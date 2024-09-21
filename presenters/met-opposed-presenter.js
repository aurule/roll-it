const { time, TimestampStyles, subtext, hyperlink, orderedList, bold } = require("discord.js")
const { oneLine } = require("common-tags")

function advantages(participant) {
  if (participant.bomb && participant.ties) return ` ${participant.mention} has bomb and ties.`
  else if (participant.bomb) return ` ${participant.mention} has bomb.`
  else if (participant.ties) return ` ${participant.mention} has ties.`
  return ""
}

function initialMessage(manager, error_message) {
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
  if (error_message) content += `\n${subtext(error_message)}`
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

function statusPrompt(manager, error_message) {
  let lines = [
    initialMessageSummary(manager) + ` The named retest is ${manager.retest_ability}.`,
    orderedList(manager.test_recorder.tests.map(test => test.present())),
    subtext(`Without a retest, the challenge will end ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)}.`)
  ]
  if (error_message) lines.push(`\n${subtext(error_message)}`)
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
  let leader = manager.current_test.leader
  const tied = !leader
  if (tied) {
    leader = manager.attacker
  }

  let content = `${leader.mention} `
  if (tied) {
    content += bold("tied")
  } else {
    content += bold("won")
  }
  content += ` the ${hyperlink("opposed test", manager.last_message_link)} against `
  const loser = manager.opposition(leader.id)
  content += loser.mention
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  return content
}

function timeoutResultMessage(manager) {
  let content = resultMessage(manager)
  content += " Time ran out to retest the result."
  return content
}

function retestOptions(manager) {
  const default_options = [
    {
      label: "other ability",
      value: "another ability",
      description: "An ability other than the named retest",
    },
    {
      label: "merit",
      value: "a merit",
    },
    {
      label: "item",
      value: "an item",
    },
    {
      label: "power",
      value: "a power",
      description: "For example, Might",
    },
    {
      label: "background",
      value: "a background",
    },
    {
      label: "willpower",
      value: "willpower",
    },
    {
      label: "automatic",
      value: "automatic",
    },
    {
      label: "other",
      value: "other",
      description: "Something else not listed here",
    },
  ]
  return [
    {
      label: manager.retest_ability,
      value: manager.retest_ability,
      description: "Named retest"
    },
    ...default_options,
  ]
}

const cancelOptions = [
  {
    label: "ability",
    value: "an ability",
  },
  {
    label: "merit",
    value: "a merit",
  },
  {
    label: "item",
    value: "an item",
  },
  {
    label: "power",
    value: "a power",
  },
  {
    label: "background",
    value: "a background",
  },
  {
    label: "willpower",
    value: "willpower",
  },
  {
    label: "other",
    value: "other",
    description: "Something else not listed here",
  },
]

function retestPrompt(manager, throws, error_message) {
  const retest = manager.current_test
  const other = manager.opposition(retest.retester.id)
  let content = `${retest.retester.mention} is retesting against ${other.mention} with ${retest.reason}.`
  if (throws) {
    content += "\n* " + (throws.get(manager.attacker.id) ? ":white_check_mark: ":":black_large_square: ") + manager.attacker.mention
    content += "\n* " + (throws.get(manager.defender.id) ? ":white_check_mark: ":":black_large_square: ") + manager.defender.mention
  }
  if (error_message) content += `\n${subtext(error_message)}`
  return content
}

function retestCancelMessage(manager) {
  const retest = manager.current_test
  const canceller = retest.canceller
  let content = `${canceller.mention} cancelled with ${retest.reason}.`
  return content
}

function retestTimeoutMessage(manager) {
  const retester = manager.current_test.retester
  let content = `${retester.mention}'s retest timed out.`
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
  retestOptions,
  cancelOptions,
  retestPrompt,
  retestCancelMessage,
  retestTimeoutMessage,
}
