/**
 * Module with functions to generate message contents for the stages of an opposed test
 * @module met-opposed-presenter
 */

const { time, TimestampStyles, subtext, hyperlink, orderedList } = require("discord.js")

/**
 * Transform a participant's advantages into a list
 *
 * @param  {Participant} participant Participant object
 * @param  {i18n.t}      t           Translation function
 * @return {str[]}                   String array of advantage words
 */
function advantages(participant, t) {
  const benefits = []

  if (participant.bomb) benefits.push(t("advantages.bomb"))
  if (participant.ties) benefits.push(t("advantages.ties"))
  if (participant.cancels) benefits.push(t("advantages.cancels"))

  if (benefits.length === 0) {
    benefits.push(t("advantages.none"))
  }
  return benefits
}

/**
 * Get the condition string for the manager's test conditions
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str[]}                     String describing test conditions
 */
function conditions(manager) {
  const t = manager.t

  if (manager.carrier && manager.altering) return t("state.initial.prompt.conditions.both")
  if (manager.carrier) return t("state.initial.prompt.conditions.carrier")
  if (manager.altering) return t("state.initial.prompt.conditions.altering")
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
  const t = manager.t

  const allowed_advantages = manager.allow_retests ? ["bomb", "ties", "cancels"] : ["bomb", "ties"] // extern

  const main_args = {
    attacker: manager.attacker,
    defender: manager.defender,
    attribute: manager.attribute,
    description: manager.description,
    context: manager.description ? "description" : undefined,
    advantages: advantages(manager.attacker, t),
    allowed_advantages,
  }

  const lines = [t("state.initial.prompt.body", main_args)]

  if (manager.is_special) {
    lines.push(conditions(manager))
  }

  lines.push(
    t("state.initial.prompt.timeliness", {
      attacker: manager.attacker,
      timeout: time(manager.prompt_ends_at, TimestampStyles.RelativeTime),
    }),
  )

  if (!manager.allow_retests) {
    lines.push(subtext(t("state.initial.prompt.noRetest")))
  }
  if (error_message) lines.push(subtext(error_message))

  return lines.join("\n")
}

/**
 * Get a summary of the challenge's kickoff
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Detailed summary message
 */
function initialMessageSummary(manager) {
  const t = manager.t
  const t_args = {
    attacker: manager.attacker,
    defender: manager.defender,
    attribute: manager.attribute,
    description: manager.description,
    context: manager.description ? "description" : undefined,
    attacker_advantages: advantages(manager.attacker, t),
    defender_advantages: advantages(manager.defender, t),
  }

  const lines = [t("state.initial.summary.body", t_args)]

  if (manager.is_special) {
    lines.push(conditions(manager))
  }

  return lines.join("\n")
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
  const t_args = {
    attacker: manager.attacker,
    defender: manager.defender,
  }
  return manager.t("state.initial.response.relent", t_args)
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
  const t_args = {
    attacker: manager.attacker,
    defender: manager.defender,
  }
  return manager.t("state.initial.response.cancel", t_args)
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
  const t_args = {
    attacker: manager.attacker,
    defender: manager.defender,
  }
  return manager.t("state.initial.response.timeout", t_args)
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
      manager.t("state.status.prompt.timer", {
        timeout: time(manager.prompt_ends_at, TimestampStyles.RelativeTime),
      }),
    ),
  ]
  if (error_message) lines.push(subtext(error_message))
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
    initialMessageSummary(manager) +
      " " +
      manager.t("state.status.summary.retest", { retest_ability: manager.retest_ability }),
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
  const t = manager.t
  const link = hyperlink(t("state.done.linkText"), manager.initial_message_link)
  const t_args = {
    attacker: manager.attacker,
    defender: manager.defender,
    description: manager.description,
    context: manager.description ? "description" : undefined,
    link,
  }
  const leader = manager.current_test.leader

  if (!leader) {
    return t("state.done.attacker.tie", t_args)
  } else if (leader.id === manager.attacker.id) {
    return t("state.done.attacker.win", t_args)
  } else {
    return t("state.done.defender.win", t_args)
  }
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
  content += " " + manager.t("state.done.timeout")
  return content
}

/**
 * Get the text to prompt a user to cancel a retest
 *
 * @param  {MetOpposedManager} manager       Object controlling information about the challenge
 * @param  {str}               error_message Optional error text to include in the message
 * @return {str}                             Formatted cancel prompt message
 */
function retestCancelPrompt(manager, error_message) {
  const t = manager.t
  const retest = manager.current_test
  const retester = retest.retester
  const other = manager.opposition(retester.id)

  const lines = [
    t("state.cancel.prompt", {
      retester,
      other,
      reason: retest.reason,
      timeout: time(manager.prompt_ends_at, TimestampStyles.RelativeTime),
    }),
  ]

  if (other.cancels) lines.push(subtext(t("state.cancel.special", { retester })))
  if (error_message) lines.push(subtext(error_message))

  return lines.join("\n")
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
  return manager.t("state.cancel.response.cancelled", {
    canceller,
    cancelled_with: retest.cancelled_with,
  })
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
  return manager.t("state.cancel.response.timeout", { retester, other })
}

/**
 * Get the text to show when a retester withdraws their retest
 *
 * @param  {MetOpposedManager} manager Object controlling information about the challenge
 * @return {str}                       Formatted retest withdraw message
 */
function retestWithdrawMessage(manager) {
  const retester = manager.current_test.retester
  return manager.t("state.retest.response.withdraw", { retester })
  return `${retester.mention} withdrew their retest.`
}

/**
 * Get the text to show when a canceller allows the retest.
 * @param  {[type]} manager [description]
 * @return {[type]}         [description]
 */
function retestContinueMessage(manager) {
  const retester = manager.current_test.retester
  const canceller = manager.opposition(retester.id)
  return manager.t("state.cancel.response.waived", { retester, canceller })
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
  const t = manager.t
  const retest = manager.current_test
  const retester = manager.current_test.retester
  const other = manager.opposition(retest.retester.id)

  const t_args = {
    retester,
    retester_advantages: advantages(retester, t),
    other,
    other_advantages: advantages(other, t),
    reason: retest.reason,
    timeout: time(manager.prompt_ends_at, TimestampStyles.RelativeTime),
  }
  let content = t("state.retest.prompt", t_args)

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
  return manager.t("state.retest.response.timeout", { retester })
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
  retestCancelPrompt,
  retestCancelMessage,
  timeoutCancelRetestMessage,
  retestWithdrawMessage,
  retestContinueMessage,
  retestPrompt,
  retestTimeoutMessage,
}
