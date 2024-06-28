const { inlineCode, italic } = require("discord.js")

/**
 * Return a formatted version of the command's name
 *
 * @param  {Command} command  The command object to present
 * @return {String}           Markdown-formatted string of the command's name
 */
function present(command) {
  return command.type == "menu" ? italic(command.name) : inlineCode(`/${command.name}`)
}

/**
 * Return a formatted version of the subcommand's name
 *
 * @param  {Command}    parent Command object that is the entry point to the subcommand
 * @param  {Subcommand} child  Subcommand object to present
 * @return {String}            Markdown-formatted string of the subcommand's fully qualified name
 */
function presentSub(parent, child) {
  return inlineCode(`/${parent.name} ${child.name}`)
}

/**
 * Make a text list of all commands
 *
 * @param  {Collection} all_commands Optional collection of Command objects. Defaults to the `commands` module.
 * @return {str}                     Markdown-formatted string of all commands and their subcommands
 */
function list(all_commands) {
  const commands = all_commands ?? require("../commands")
  return commands
    .filter(c => c.type !== "menu")
    .map(cmd => {
      let content = `* ${present(cmd)} - ${cmd.description}`
      if (cmd.subcommands) {
        const subcontent = cmd.subcommands
          .map((subc, _k) => `  - ${presentSub(cmd, subc)} - ${subc.description}`)
          .join("\n")
        content += `\n${subcontent}`
      }
      return content
    })
    .join("\n")
}

module.exports = {
  present,
  presentSub,
  list,
}
