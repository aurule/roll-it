const { italic, inlineCode, bold } = require("discord.js")

/**
 * Present the list of available saved rolls
 *
 * @param  {obj[]} rolls Array of saved_roll info objects
 * @return {str}         String with the saved roll list
 */
function presentList(saved_rolls) {
  if (!saved_rolls.length)
    return `You have no saved rolls. Make some with ${inlineCode("/saved add")}!`

  let content = "These are your saved rolls:"
  content += saved_rolls.map(r => `\n* ${presentRollName(r)}\n  - ${presentInvocation(r)}`).join("")
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
  for (const [key, value] of Object.entries(options)) {
    content_lines += " " + key + ":" + value
  }

  return inlineCode(content_lines)
}

module.exports = {
  presentList,
  presentRollName,
  presentInvocation,
}