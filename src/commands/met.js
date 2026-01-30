import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { loadSubcommands, dispatch } from "../util/subcommands.js"

const command_name = "met"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .addSubcommand(subcommands.get("static").data())
      .addSubcommand(subcommands.get("opposed").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
}
