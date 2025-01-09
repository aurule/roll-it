const { SlashCommandSubcommandBuilder, MessageFlags } = require("discord.js")
const CommandHelpPresenter = require("../../presenters/command-help-presenter")
const CommandNamePresenter = require("../../presenters/command-name-presenter")
const Completers = require("../../completers/command-completers")
const { i18n } = require("../../locales")

module.exports = {
  name: "command",
  parent: "help",
  description: "Get help about a command",
  data() {
    return new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("command")
          .setDescription("The command you want help with")
          .setAutocomplete(true)
          .setRequired(true),
      )
  },
  execute(interaction) {
    const command_name = interaction.options.getString("command") ?? ""

    const t = i18n.getFixedT(interaction.locale, "commands", "help.command")

    const command = interaction.client.commands.get(command_name)

    if (!command?.help)
      return interaction.whisper(t("options.command.validation.unavailable", { command_name }))

    const full_text = CommandHelpPresenter.present(command)
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
  help() {
    return ["Here are all the available commands:", CommandNamePresenter.list()].join("\n")
  },
}
