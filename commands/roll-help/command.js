const { SlashCommandSubcommandBuilder } = require("discord.js")
const CommandHelpPresenter = require("../../presenters/command-help-presenter")
const CommandNamePresenter = require("../../presenters/command-name-presenter")
const { longReply } = require("../../util/long-reply")
const Completers = require("../../completers/command-completers")

module.exports = {
  name: "command",
  parent: "roll-help",
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

    const command = interaction.client.commands.get(command_name)

    if (!command?.help)
      return interaction.reply({
        content: `No help is available for the command "${command_name}"`,
        ephemeral: true,
      })

    const full_text = CommandHelpPresenter.present(command)
    return longReply(interaction, full_text, { ephemeral: true })
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch (focusedOption.name) {
      case "command":
        return Completers.all(partialText)
    }
  },
  help({ command_name }) {
    return [
      "Here are all the available commands:",
      CommandNamePresenter.list(),
    ].join("\n")
  },
}
