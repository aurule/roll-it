const { inlineCode, italic } = require("discord.js")

const { i18n } = require("../locales")

/**
 * Return a formatted version of the command's name
 *
 * Menu commands are shown in italics.
 *
 * Slash commands are shown as inline code. Subcommands are prefixed with their parent name, which must be
 * present on the subcommand object.
 *
 * @param  {Command} command  The command object to present
 * @param  {str}     locale   Locale name for the command string
 * @return {String}           Markdown-formatted string of the command's name
 */
function present(command, locale) {
  const t = i18n.getFixedT(locale)
  const command_id = command.id ?? command.name

  if (command.type == "menu") return t("command-name.menu", { command_name: t(`commands:${command_id}.name`)})

  if (command.parent) {
    return t("command-name.subcommand", { parent_name: t(`commands:${command.parent}.name`), command_name: t(`commands:${command.parent}.${command_id}.name`) })
  }

  return t("command-name.slash", { command_name: t(`commands:${command_id}.name`)})
}

/**
 * Make a text list of all commands
 *
 * @param  {Collection}       all_commands Collection of Command objects
 * @param  {str}              locale       Locale name for the command string
 * @return {Array<str|str[]>}              List of markdown-formatted command names, including subcommands
 */
function list(all_commands, locale) {
  const t = i18n.getFixedT(locale)
  return all_commands
    .map((cmd) => {
      const command_id = cmd.id ?? cmd.name
      let description
      if (cmd.parent) {
        description = t(`commands:${cmd.parent}.${command_id}.description`)
      } else {
        description = t(`commands:${command_id}.description`)
      }
      return `${present(cmd, locale)} - ${description}`
    })
}

module.exports = {
  present,
  list,
}
