const { i18n } = require("../locales")

/**
 * Return a formatted version of the command's name
 *
 * Menu commands are shown in italics.
 *
 * Slash commands are shown as inline code. Subcommands are prefixed with their parent name, which must be
 * present on the subcommand object.
 *
 * @example
 * ```js
 * const command = commands.get("coin")
 * present(command, "en-US")
 * // yields "`/chop`"
 * ```
 *
 * @param  {Command} command  The command object to present
 * @param  {str}     locale   Locale name for the command string
 * @param  {object}  options  Optional options object
 * @return {String}           Markdown-formatted string of the command's name
 */
function present(command, locale, options = {}) {
  const t = i18n.getFixedT(locale)
  const command_id = command.i18nId ?? command.name
  const t_args = {}

  if (options.unformatted) {
    t_args.context = "plain"
  }

  if (command.type == "menu")
    return t("command-name.menu", { ...t_args, command_name: t(`commands:${command_id}.name`) })

  if (command.parent) {
    return t("command-name.subcommand", {
      ...t_args,
      parent_name: t(`commands:${command.parent}.name`),
      command_name: t(`commands:${command.parent}.${command_id}.name`),
    })
  }

  return t("command-name.slash", { ...t_args, command_name: t(`commands:${command_id}.name`) })
}

/**
 * Make a text list of all commands
 *
 * This list is intended to be formatted using the discord.js `ul` function.
 *
 * @param  {Collection}       all_commands Collection of Command objects, ideally sorted
 * @param  {str}              locale       Locale name for the command string
 * @return {Array<str|str[]>}              List of markdown-formatted command names, including subcommands
 */
function list(all_commands, locale) {
  const t = i18n.getFixedT(locale, "commands")
  return all_commands.map((cmd) => {
    const command_id = cmd.i18nId ?? cmd.name
    const description = cmd.parent
      ? t(`${cmd.parent}.${command_id}.description`)
      : t(`${command_id}.description`)
    return `${present(cmd, locale)} - ${description}`
  })
}

module.exports = {
  present,
  list,
}
