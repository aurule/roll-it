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
    // const t = i18n.getFixedT(locale, "commands", "help.command")
    // const cmd_t = i18n.getFixedT(locale, "commands", command.name)

    // const command_options = command.data().options ?? []
    // const command_name = CommandNamePresenter.present(command, locale)

    // const options = command_options.map((opt) => {
    //   const localized_name = opt.name_localizations[locale] ?? opt.name
    //   const localized_description = opt.description_localizations[locale] ?? opt.description
    //   const opt_args = {
    //     context: opt.required ? "required" : undefined,
    //     name: localized_name,
    //     description: localized_description
    //   }
    //   return "\t" + t("response.opt", opt_args)
    // }).join("\n")


    // const option_names = command_options.map((opt) => {
    //   const localized_name = opt.name_localizations[locale] ?? opt.name
    //   return inlineCode(localized_name)
    // })
    // const help_opts = {
    //   command_name,
    //   opts: option_names,
    //   locale,
    // }
    // if (command.help_data) {
    //   Object.assign(help_opts, command.help_data(help_opts))
    // }
    // const help_text = cmd_t("help", help_opts)


    // const localized_description = command.description_localizations[locale] ?? command.description
    // const body_args = {
    //   count: command_options.length,
    //   command_name,
    //   description: localized_description,
    //   options,
    //   help_text,
    // }
    // const body_parts = ["response.body"]
    // if (command_options.length) {
    //   if (command.subcommands) {
    //     body_parts.push("subcommands")
    //   } else {
    //     body_parts.push("args")
    //   }
    // } else {
    //   body_parts.push("simple")
    // }
    // const body_key = body_parts.join(".")
    // return t(body_key, body_args)

    const command_options = command.data().options
    const command_name = CommandNamePresenter.present(command)

    let lines = [`Showing help for ${command_name}: ${command.description}`]

    const formatted_options = {}
    if (command_options?.length) {
      lines.push("")
      if (command.subcommands) {
        lines.push("Subcommands:")
      } else {
        lines.push("Args:")
      }
      lines = lines.concat(
        command_options.map((opt) => {
          formatted_options[opt.name] = inlineCode(opt.name)
          let opt_lines = [`\t${inlineCode(opt.name)}:`]
          if (opt.required) opt_lines.push("(required)")
          opt_lines.push(opt.description)

          return opt_lines.join(" ")
        }),
      )
    }

    lines.push("")
    lines.push(command.help({ command_name, ...formatted_options }))

    return lines.join("\n")
  },
}
