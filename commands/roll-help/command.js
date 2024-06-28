// const CommandChoicesTransformer = require("../../transformers/command-choices-transformer")
const CommandHelpPresenter = require("../../presenters/command-help-presenter")
const { longReply } = require("../../util/long-reply")

module.exports = {
  name: "command",
  description: "Get help about a command",
  data(subcommand) {
    // const commands = require("../index")
    return subcommand
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("command")
          .setDescription("The command you want help with")
          // .setChoices(...CommandChoicesTransformer.transform(commands))
          .setRequired(true),
      )
  },
  execute(interaction) {
    const command_name = interaction.options.getString("command") ?? module.exports.name

    const command = interaction.client.commands.get(command_name)

    if (!command?.help)
      return interaction.reply({
        content: `No help is available for the command "${command_name}"`,
        ephemeral: true,
      })

    const full_text = CommandHelpPresenter.present(command)
    return longReply(interaction, full_text, { ephemeral: true })
  },
  help({ command_name }) {
    return "TBD"
  },
}
