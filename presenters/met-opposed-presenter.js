/**
 * Module with functions to generate message contents for the stages of an opposed test
 * @module met-opposed-presenter
 */

const { time, TimestampStyles, subtext, hyperlink, orderedList, bold } = require("discord.js")
const { oneLine } = require("common-tags")

/**
 * Show the special advantages a participant has
 *
 * @param  {Participant} participant Participant to describe
 * @return {str}                     String describing their bomb and ties status
 */
function advantages(participant) {
  const benefits = []

  if (participant.bomb) benefits.push("bomb")
  if (participant.ties) benefits.push("ties")
  if (participant.cancels) benefits.push("cancels")

  if (!benefits.length) return ""

  return ` ${participant.mention} has ` + benefits.join(", ") + "."
}

/**
 * Get the initial message of an opposed challenge
 *
 * This message is meant to notify the defending user that they're being challenged and provide information
 * about the test. The interactive components added by the manager should allow the defender to pick their
 * advantages and their throw, or to concede. The components should also provide the attacker a way to cancel
 * the test, as in the case of the wrong user or the immediate conflict being resolved before the test is
 * actually needed.
 *
 * @param  {MetOpposedManager} manager       Object controlling information about the challenge
 * @param  {str}               error_message Optional error message to show in the prompt
 * @return {str}                             Detailed prompt message
 */
function initialMessage(manager, error_message = "") {
  let content = `${manager.attacker.mention} is challenging you, ${manager.defender.mention} with a ${manager.attribute} test`
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  content += advantages(manager.attacker)
  content += " If you have"
  if (manager.allow_retests) content += " bomb, ties, or special cancels"
  else content += " bomb or ties"
  content += ", you must declare them now."
  content += "\n"
  content += oneLine`
    If you don't respond ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)}, the challenge will
    end and ${manager.attacker.mention} will likely succeed.
  `
  if (!manager.allow_retests)
    content +=
      "\n" +
      subtext(
        "This test is being made without interactive retests. Retest options will not be shown.",
      )
  if (error_message) content += "\n" + subtext(error_message)
  return content
}

/**
 * Get a summary of the challenge's kickoff
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed summary message
 */
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

/**
 * Get the message to show when the defender relents
 *
 * This is intended to be an end-state message for the challenge.
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed relented message
 */
function relentMessage(manager) {
  return `${manager.defender.mention} relented to the opposed test from ${manager.attacker.mention}.`
}

/**
 * Get the message to show when the attacker cancels
 *
 * This is intended to be an end-state message for the challenge.
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed cancellation message
 */
function cancelMessage(manager) {
  return `${manager.attacker.mention} cancelled their opposed test against ${manager.defender.mention}.`
}

/**
 * Get the message to show when the initial prompt timer ends
 *
 * This is intended to be an end-state message for the challenge.
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed timeout message
 */
function timeoutRelentMessage(manager) {
  return `${manager.defender.mention} did not respond to the opposed test from ${manager.attacker.mention}.`
}

/**
 * Get the status message text
 *
 * This is meant to generate message contents multiple times during a challenge that has retests. Interactive
 * components added at runtime are expected to show the option to retest the most recent chop.
 *
 * @param  {MetOpposedManager} manager       Object controlling information about the challenge
 * @param  {str}               error_message Optional error message to show in the prompt
 * @return {str}                             Detailed status prompt
 */
function statusPrompt(manager, error_message) {
  let lines = [
    statusSummary(manager),
    subtext(
      `Without a retest, the challenge will end ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)}.`,
    ),
  ]
  if (error_message) lines.push(`${subtext(error_message)}`)
  return lines.join("\n")
}

/**
 * Get the status summary message
 *
 * This is meant to be shown in place of the status prompt when no actions are necessary.
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed status message
 */
function statusSummary(manager) {
  let lines = [
    initialMessageSummary(manager) + ` The named retest is ${manager.retest_ability}.`,
    orderedList(manager.test_recorder.tests.map((test) => test.present())),
  ]
  return lines.join("\n")
}

/**
 * Get the final message displaying the challenge's results
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed result message
 */
function resultMessage(manager) {
  let leader = manager.current_test.leader
  const tied = !leader
  if (tied) {
    leader = manager.attacker
  }

  let content = `${leader.mention} `
  content += tied ? bold("tied") : bold("won")

  if (leader.id === manager.attacker.id) {
    content += ` their ${hyperlink("opposed test", manager.initial_message_link)} against `
  } else {
    content += ` the ${hyperlink("opposed test", manager.initial_message_link)} from `
  }

  const loser = manager.opposition(leader.id)
  content += loser.mention
  if (manager.description) content += ` for "${manager.description}"`
  content += "."
  return content
}

/**
 * Get the results message to show when the timer expires
 *
 * This uses the default result message and adds an explanation of the timeout.
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed result message
 */
function timeoutResultMessage(manager) {
  let content = resultMessage(manager)
  content += " Time ran out to retest the result."
  return content
}

/**
 * Get the options for retesting a chop
 *
 * We don't do any logic around limiting what can be used when, so this just inserts the named retest before
 * a set of default options.
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {obj[]}                     Array of option objects.
 */
function retestOptions(manager) {
  const default_options = [
    {
      label: "other ability",
      value: "another ability",
      description: "An ability other than the named retest",
    },
    {
      label: "power",
      value: "a power",
      description: "For example, Might",
    },
    {
      label: "item",
      value: "an item",
    },
    {
      label: "merit",
      value: "a merit",
    },
    {
      label: "overbid",
      value: "overbid",
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
      label: "pve",
      value: "pve",
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
      description: "Named retest",
    },
    ...default_options,
  ]
}

/**
 * Array of component select menu options for cancelling a retest.
 *
 * @type {obj[]}
 */
const cancelOptions = [
  {
    label: "ability",
    value: "an ability",
  },
  {
    label: "power",
    value: "a power",
  },
  {
    label: "other",
    value: "other",
    description: "Something else not listed here",
  },
]

/**
 * Get the text to prompt a user to cancel a retest
 *
 * @param  {MetOpposedManager} manager       Object controlling information about the challenge
 * @param  {str}               error_message Optional error text to include in the message
 * @return {str}                             Formatted cancel prompt message
 */
function retestCancelPrompt(manager, error_message) {
  const retest = manager.current_test
  const retester = retest.retester
  const other = manager.opposition(retester.id)
  let content = oneLine`
    ${retester.mention} is retesting against you, ${other.mention} with ${retest.reason}. Are you able to
    cancel their retest? If you don't cancel ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)},
    the retest will proceed.
  `
  if (other.cancels)
    content +=
      "\n" +
      subtext(
        `You can cancel without using an ability, so you will see this prompt for every retest from ${retester.mention}.`,
      )
  if (error_message) content += "\n" + subtext(error_message)
  return content
}

/**
 * Get the text to show when a retest is cancelled
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Formatted cancel message
 */
function retestCancelMessage(manager) {
  const retest = manager.current_test
  const canceller = retest.canceller
  let content = `${canceller.mention} cancelled with ${retest.cancelled_with}.`
  return content
}

/**
 * Get the text to show when a retest cancel prompt times out
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Formatted retest cancellation timeout message
 */
function timeoutCancelRetestMessage(manager) {
  const retester = manager.current_test.retester
  const other = manager.opposition(retester.id)
  return `${other.mention} ran out of time to cancel the retest by ${retester.mention}.`
}

/**
 * Get the text to show when a retester withdraws their retest
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Formatted retest withdraw message
 */
function retestWithdrawMessage(manager) {
  const retester = manager.current_test.retester
  return `${retester.mention} withdrew their retest.`
}

/**
 * Get the text to show when a canceller
 * @param  {[type]} manager [description]
 * @return {[type]}         [description]
 */
function retestContinueMessage(manager) {
  const retester = manager.current_test.retester
  const canceller = manager.opposition(retester.id)
  return `${canceller.mention} did not cancel the retest by ${retester.mention}.`
}

/**
 * Get the text for the retest message
 *
 * This shows the chop request status of each user using the `responses` map. Each key of `responses` must
 * be a keyword:
 * - "choice" for selection made, but Throw button not clicked
 * - "commit" for selection made and Throw button clicked
 * - any other value for no selection made and no button clicked
 *
 * @param  {MetOpposedManager} manager       Object controlling information about the challenge
 * @param  {Collection}        responses     Collection of responses by user ID
 * @param  {str}               error_message Optional error text to include in the message
 * @return {str}                             Message string
 */
function retestPrompt(manager, responses, error_message) {
  const retest = manager.current_test
  const retester = manager.current_test.retester
  const other = manager.opposition(retest.retester.id)
  let content = `${retest.retester.mention} is retesting against ${other.mention} with ${retest.reason}.`
  content += advantages(retester)
  content += advantages(other)
  content += "\n"
  content += oneLine`
    You both have to make your throw ${time(manager.prompt_ends_at, TimestampStyles.RelativeTime)} or the
    retest will be cancelled for time.
  `

  const symbol = (response) => {
    switch (response) {
      case "choice":
        return ":thought_balloon: "
      case "commit":
        return "<:rpsgo:1303828291492515932> "
      default:
        return ":black_large_square: "
    }
  }

  content += "\n* " + symbol(responses.get(manager.attacker.id)) + manager.attacker.mention
  content += "\n* " + symbol(responses.get(manager.defender.id)) + manager.defender.mention
  if (error_message) content += `\n${subtext(error_message)}`
  return content
}

/**
 * Get the text to show when a retest times out
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Formatted retest timeout message
 */
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
  timeoutResultMessage,
  retestOptions,
  cancelOptions,
  retestCancelPrompt,
  retestCancelMessage,
  timeoutCancelRetestMessage,
  retestWithdrawMessage,
  retestContinueMessage,
  retestPrompt,
  retestTimeoutMessage,
}
