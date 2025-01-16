const { oneLine } = require("common-tags")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const TopicNamePresenter = require("../presenters/topic-name-presenter")
const { loadSubcommands, dispatch } = require("../util/subcommands")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "help"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  global: true,
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
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
  help_data(opts) {
    const commands = require("./index")
    return {
      topics: TopicNamePresenter.list(),
      commands: CommandNamePresenter.list(commands),
    }
  },
}
