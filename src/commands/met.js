const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { loadSubcommands, dispatch } = require("../util/subcommands")

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
