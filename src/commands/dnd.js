import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { loadSubcommands, dispatch } from "../util/subcommands.js"

const command_name = "dnd"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .addSubcommand(subcommands.get("attack").data())
      .addSubcommand(subcommands.get("full-attack").data())
      .addSubcommand(subcommands.get("save").data())
      .addSubcommand(subcommands.get("skill").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
}
