import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { loadSubcommands, dispatch } from "../util/subcommands.js"
import { list } from "../presenters/command-name-presenter.js"

const command_name = "saved"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  global: true,
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder("saved")
      .setDMPermission(false)
      .addSubcommand(subcommands.get("roll").data())
      .addSubcommand(subcommands.get("grow").data())
      .addSubcommand(subcommands.get("list").data())
      .addSubcommand(subcommands.get("manage").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help_data(opts) {
    const savable_commands = require("./index").sorted.savable.get(opts.locale)
    return {
      savable: list(savable_commands, opts.locale),
    }
  },
}
