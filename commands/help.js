const { SlashCommandBuilder, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const CommandNamePresenter = require("../presenters/command-name-presenter")
const TopicNamePresenter = require("../presenters/topic-name-presenter")
const { loadSubcommands, dispatch } = require("../util/subcommands")
const { i18n } = require("../locales")

const subcommands = loadSubcommands("help")

module.exports = {
  name: "help",
  description: i18n.t("commands:help.description"),
  global: true,
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addSubcommand(subcommands.get("topic").data())
      .addSubcommand(subcommands.get("command").data())
      .addSubcommand(subcommands.get("feedback").data())
      .setDMPermission(true)
  },
  execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help(command_name) {
    return [
      `The ${command_name} commands let you read about how Roll It works, and send feedback to the developer.`,
      "",
      oneLine`
        Use ${inlineCode("/help command")} and ${inlineCode("/help topic")} to read about Roll It's commands
        and general usage. Both let you pick from a list, so you don't need to memorize command or topic names.
      `,
      "",
      `Use ${inlineCode("/help feedback")} to send feedback to Roll It's developer.`,
      "",
      "Here are the available help topics:",
      TopicNamePresenter.list(),
      "",
      "And here are the slash commands:",
      CommandNamePresenter.list(),
    ].join("\n")
  },
}
