import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { list as topicList } from "../presenters/topic-name-presenter.js"
import { list as commandList } from "../presenters/command-name-presenter.js"
import { loadSubcommands, dispatch } from "../util/subcommands.js"

const command_name = "help"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
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
      topics: topicList(opts.locale),
      commands: commandList(commands.sorted.get(opts.locale), opts.locale),
    }
  },
}
