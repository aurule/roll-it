const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const CommandHelpPresenter = require("../../presenters/command-help-presenter")
const CommandNamePresenter = require("../../presenters/command-name-presenter")
const Completers = require("../../completers/command-completers")
const { i18n } = require("../../locales")

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

    const full_text = CommandHelpPresenter.present(command, interaction.locale)
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
        return Completers.all(partialText)
    }
  },
  help_data(opts) {
    const commands = require("../index")
    return {
      commands: CommandNamePresenter.list(commands, opts.locale),
    }
  },
}
