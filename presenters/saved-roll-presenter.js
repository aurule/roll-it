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

function presentRollName(saved_roll) {
  let content_lines = ""
  if (saved_roll.invalid) content_lines += ":x: "
  if (saved_roll.incomplete) content_lines += ":warning: "
  content_lines += `${italic(saved_roll.name)} - ${saved_roll.description}`
  return content_lines
}

function presentInvocation(saved_roll) {
  let content_lines = "/" + saved_roll.command
  for (const [key, value] of Object.entries(saved_roll.options)) {
    content_lines += " " + key + ":" + value
  }

  return inlineCode(content_lines)
}

module.exports = {
  presentList,
  presentRollName,
  presentInvocation,
}
