const CommandNamePresenter = require("./command-name-presenter")
const { inlineCode } = require("discord.js")

module.exports = {
  /**
   * Return a formatted message string of the command's name and help text
   *
   * @param  {Command} command  The command object to present
   * @return {String}           Markdown-formatted string of the command's name and help text
   */
  present: (command) => {
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
