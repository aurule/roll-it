import { present as presentCommandName } from "./command-name-presenter"
import { inlineCode } from "discord.js"
import { i18n } from "../locales/index.js"

/**
 * Return a formatted message string of the command's name and help text
 *
 * @param  {Command} kommand  The command class to present
 * @param  {str}     locale   Locale code for loading strings
 * @return {String}           Markdown-formatted string of the command's name and help text
 */
export function present(kommand, locale) {
  const prefix_parts = []
  if (kommand.parent) prefix_parts.push(kommand.parent)
  if (kommand.i18nId) {
    prefix_parts.push(kommand.i18nId)
  } else {
    prefix_parts.push(kommand.name)
  }
  const command_prefix = prefix_parts.join(".")

  const help_t = i18n.getFixedT(locale, "commands", "help.command")
  const cmd_t = i18n.getFixedT(locale, "commands", command_prefix)

  const command_options = kommand.data().subcommands ?? kommand.data().options ?? []
  const command_name = presentCommandName(kommand, locale)

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
  const subcommands = kommand.children ?? []
  for (const sub of subcommands) {
    const presented = presentCommandName(sub, locale)
    subcommand_names[sub.name] = presented
  }
  const help_opts = {
    cmd: command_name,
    opts: option_names,
    sub: subcommand_names,
    locale,
  }
  Object.assign(help_opts, kommand.help_data(help_opts))
  const help_text = cmd_t("help", help_opts)

  const title_args = {
    command_name,
    description: cmd_t("description"),
  }
  const help_lines = [help_t("response.title", title_args)]

  if (command_options.length) {
    const args_args = {
      count: command_options.length,
      context: kommand.children ? "subcommands" : undefined,
      options: options_list,
    }
    help_lines.push(help_t("response.args", args_args))
  }

  help_lines.push(help_text)
  return help_lines.join("\n\n")
}
