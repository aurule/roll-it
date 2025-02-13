const CommandNamePresenter = require("./command-name-presenter")
const { inlineCode } = require("discord.js")
const { i18n } = require("../locales")

module.exports = {
  /**
   * Return a formatted message string of the command's name and help text
   *
   * @param  {Command} command  The command object to present
   * @param  {str}     locale   Locale code for loading strings
   * @return {String}           Markdown-formatted string of the command's name and help text
   */
  present: (command, locale) => {
    const prefix_parts = []
    if (command.parent) prefix_parts.push(command.parent)
    if (command.id) {
      prefix_parts.push(command.id)
    } else {
      prefix_parts.push(command.name)
    }
    const command_prefix = prefix_parts.join(".")

    const help_t = i18n.getFixedT(locale, "commands", "help.command")
    const cmd_t = i18n.getFixedT(locale, "commands", command_prefix)

    const command_options = command.data().subcommands ?? command.data().options ?? []
    const command_name = CommandNamePresenter.present(command, locale)

    const options_list = command_options.map((opt) => {
      const localized_name = opt.name_localizations[locale]
      const localized_description = opt.description_localizations[locale]
      const opt_args = {
        context: opt.required ? "required" : undefined,
        name: localized_name,
        description: localized_description,
      }
      return help_t("response.opt", opt_args)
    })

    const option_names = {}
    for (const opt of command_options) {
      const localized_name = opt.name_localizations[locale]
      option_names[opt.name] = inlineCode(localized_name)
    }
    const subcommand_names = {}
    const subcommands = command.subcommands?.values() ?? []
    for (const sub of subcommands) {
      const presented = CommandNamePresenter.present(sub, locale)
      subcommand_names[sub.name] = presented
    }
    const help_opts = {
      cmd: command_name,
      opts: option_names,
      sub: subcommand_names,
      locale,
    }
    if (command.help_data) {
      Object.assign(help_opts, command.help_data(help_opts))
    }
    const help_text = cmd_t("help", help_opts)

    const title_args = {
      command_name,
      description: cmd_t("description"),
    }
    const help_lines = [help_t("response.title", title_args)]

    if (command_options.length) {
      const args_args = {
        count: command_options.length,
        context: command.subcommands ? "subcommands" : undefined,
        options: options_list,
      }
      help_lines.push(help_t("response.args", args_args))
    }

    help_lines.push(help_text)
    return help_lines.join("\n\n")
  },
}
