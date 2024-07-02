const { SlashCommandBuilder, italic } = require("discord.js")
const { oneLine } = require("common-tags")

const CommandNamePresenter = require("../presenters/command-name-presenter")
const TopicNamePresenter = require("../presenters/topic-name-presenter")
const Topics = require("../help")
const { loadSubcommands, dispatch } = require("../util/subcommands")

const subcommands = loadSubcommands("roll-help")

module.exports = {
  name: "roll-help",
  description: "Get help with Roll It and its commands",
  global: true,
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addSubcommand(subcommands.get("topic").data())
      .addSubcommand(subcommands.get("command").data())
      .setDMPermission(true)
  },
  execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help({ command_name }) {
    const commands = require("./index")
    return [
      oneLine`
        Both sub-commands let you pick from a list, so you don't need to memorize command or topic names.
      `,
      "",
      "Here are the available help topics:",
      TopicNamePresenter.list(),
      "",
      "And here are the slash commands:",
      CommandNamePresenter.list(),
    ].join("\n")
  },
}
