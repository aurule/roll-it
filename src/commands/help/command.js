import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { present as presentHelp } from "../../presenters/command-help-presenter.js"
import { list as listCommands } from "../../presenters/command-name-presenter.js"
import { all as suggestCommands } from "../../completers/command-completers.js"
import { i18n } from "../../locales/index.js"

const command_name = "command"
const parent_name = "help"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name).addLocalizedStringOption(
      "command",
      (option) => option.setAutocomplete(true).setRequired(true),
    ),
  execute(interaction) {
    const command_name = interaction.options.getString("command") ?? ""

    const t = i18n.getFixedT(interaction.locale, "commands", "help.command")

    const command = interaction.client.commands.get(command_name)

    if (!command)
      return interaction.whisper(t("options.command.validation.unavailable", { command_name }))

    const full_text = presentHelp(command, interaction.locale)
    return interaction.paginate({
      content: full_text,
      secret: true,
    })
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "command":
        return suggestCommands(partialText)
    }
  },
  help_data(opts) {
    const commands = require("../index")
    return {
      commands: listCommands(commands.sorted.get(opts.locale), opts.locale),
    }
  },
}
