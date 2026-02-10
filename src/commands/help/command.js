import { present as presentHelp } from "../../presenters/command-help-presenter.js"
import { list as listCommands } from "../../presenters/command-name-presenter.js"
import { all as suggestCommands } from "../../completers/command-completers.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"
import { commands, sortedCommands } from "../index.js"

/**
 * Base class for the help command command
 */
class BaseCommandHelp extends Command {
  static name = "command"

  /**
   * The response from `/help command` is always ephemeral
   * @type {boolean}
   */
  static secret = true

  command

  static data() {
    return this.builder.addLocalizedStringOption(
      "command",
      (option) => option.setAutocomplete(true).setRequired(true),
    )
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("command")
  }

  perform() {
    const commandKlass = commands.get(this.command)
    return presentHelp(commandKlass, this.locale)
  }

  validate() {
    if (!commands.has(this.command)) return this.t("options.command.validation.unavailable", { command_name: this.command })
  }

  autocomplete() {
    const focusedOption = this.interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "command":
        return suggestCommands(partialText)
    }
  }

  static help_data(opts) {
    return {
      commands: listCommands(sortedCommands(opts.locale).commands, opts.locale),
    }
  }
}

/**
 * Class for the help command command
 */
export const CommandHelp = Child(BaseCommandHelp, "help")
