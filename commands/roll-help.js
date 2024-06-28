const { SlashCommandBuilder, italic, underscore } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const CommandNamePresenter = require("../presenters/command-name-presenter")
const Topics = require("../help")
const { longReply } = require("../util/long-reply")
const { logger } = require("../util/logger")
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
      .addSubcommand((s) => subcommands.get("topic").data(s))
      .addSubcommand((s) => subcommands.get("command").data(s))
      .setDMPermission(true)
  },
  execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  help({ command_name }) {
    const commands = require("./index")
    return [
      oneLine`
        Both sub-commands let you pick from a list, so you don't need to memorize command or topic names.
      `,
      "",
      "Here are the available help topics:",
      Topics.map((t) => `* ${t.title} - ${italic(t.description)}`).join("\n"),
      "",
      "And here are the slash commands:",
      CommandNamePresenter.list(),
    ].join("\n")
  },
}
