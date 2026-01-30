import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { loadSubcommands, dispatch } from "../util/subcommands.js"

const command_name = "table"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .setDMPermission(false)
      .addSubcommand(subcommands.get("roll").data())
      .addSubcommand(subcommands.get("list").data())
      .addSubcommand(subcommands.get("add").data())
      .addSubcommand(subcommands.get("manage").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
}
