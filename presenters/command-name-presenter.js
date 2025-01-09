const { inlineCode, italic } = require("discord.js")

/**
 * Return a formatted version of the command's name
 *
 * Menu commands are shown in italics.
 *
 * Slash commands are shown as inline code. Subcommands are prefixed with their parent name, which must be
 * present on the subcommand object.
 *
 * @param  {Command} command  The command object to present
 * @return {String}           Markdown-formatted string of the command's name
 */
function present(command) {
  if (command.type == "menu") return italic(command.name)

  let presented = "/"
  if (command.parent) presented += command.parent + " "
  presented += command.name
  return inlineCode(presented)
}

// function present(command, locale) {
//   const localized_name = command.data().name_localizations[locale] ?? command.name
//   if (command.type == "menu") return italic(localized_name)

//   if (command.parent) {
//     const commands = require("../commands")
//     const parent = commands.get(parent)
//     const parent_name = parent.data().name_localizations[locale] ?? parent.name
//     return inlineCode(`/${parent_name} ${localized_name}`)
//   }

//   return inlineCode(`/${localized_name}`)
// }

/**
 * Make a text list of all commands
 *
 * @param  {Collection} all_commands Optional collection of Command objects. Defaults to the `commands` module.
 * @return {str}                     Markdown-formatted string of all commands and their subcommands
 */
function list(all_commands) {
  const commands = all_commands ?? require("../commands")
  return commands
    .filter((c) => c.type !== "menu")
    .map((cmd) => {
      let content = cmd.parent ? "  - " : "* "
      content += `${present(cmd)} - ${cmd.description}`
      return content
    })
    .join("\n")
}

module.exports = {
  present,
  list,
}
