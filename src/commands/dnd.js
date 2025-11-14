const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { loadSubcommands, dispatch } = require("../util/subcommands")

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
