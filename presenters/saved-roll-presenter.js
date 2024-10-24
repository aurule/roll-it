const { italic, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

/**
 * Present the details of a single saved roll
 *
 * @param  {obj} saved_roll Saved roll details
 * @return {str}            String describing all attributes of the saved roll
 */
function present(saved_roll) {
  const manage_lines = [
    "All about this roll:",
    `${italic("Name:")} ${saved_roll.name}`,
    `${italic("Description:")} ${saved_roll.description}`,
    `${italic("Command:")} ${saved_roll.command}`,
    `${italic("Options:")}`,
  ]
  for (const opt in saved_roll.options) {
    manage_lines.push(`* ${italic(opt + ":")} ${saved_roll.options[opt]}`)
  }
  if (saved_roll.invalid) {
    manage_lines.push(oneLine`
      :x: These options are invalid. Update them by clicking the Edit button below, then using
      ${italic("Save this roll")} to save new options.
    `)
  }
  manage_lines.push(`${italic("Invocation:")} ${presentInvocation(saved_roll)}`)
  if (saved_roll.incomplete) {
    manage_lines.push("")
    manage_lines.push(oneLine`
      :warning: This roll is incomplete! You have to finish it using ${inlineCode("/saved set")} or
      ${italic("Save this roll")} before you'll be able to roll it.
    `)
  }
  return manage_lines.join("\n")
}

/**
 * Present the list of available saved rolls
 *
 * @param  {obj[]} rolls Array of saved_roll info objects
 * @return {str}         String with the saved roll list
 */
function presentList(saved_rolls) {
  if (!saved_rolls.length)
    return oneLine`
      You have no saved rolls. Make some with ${inlineCode("/saved set")} and
      ${italic("Save this roll")}!
    `

  let content = "These are your saved rolls:"
  content += saved_rolls
    .map((r) => `\n* ${presentRollName(r)}\n  - ${presentInvocation(r)}`)
    .join("")
  content += "\n-# Legend:"
  content += "\n-# :warning: means that roll is incomplete"
  content += "\n-# :x: means that roll is not valid"
  return content
}

/**
 * Present a saved roll's name, description, and status
 *
 * @param  {obj} saved_roll Saved roll info object
 * @return {str}            Status, name, and description of the saved roll
 */
function presentRollName(saved_roll) {
  let content_lines = ""
  const name = saved_roll.name ?? "(incomplete)"
  const description = saved_roll.description ?? "(incomplete)"
  if (saved_roll.invalid) content_lines += ":x: "
  if (saved_roll.incomplete) content_lines += ":warning: "
  content_lines += `${italic(name)} - ${description}`
  return content_lines
}

/**
 * Present a saved roll's command invocation
 *
 * This string is meant to be usable by pasting it directly into discord's chat.
 *
 * @param  {obj} saved_roll Saved roll info object
 * @return {str}            Invocation string
 */
function presentInvocation(saved_roll) {
  const command_name = saved_roll.command ?? "(not set)"
  const options = saved_roll.options ?? {}

  let content_lines = "/" + command_name
  for (const opt in options) {
    content_lines += ` ${opt}:${options[opt]}`
  }

  return inlineCode(content_lines)
}

module.exports = {
  present,
  presentList,
  presentRollName,
  presentInvocation,
}
