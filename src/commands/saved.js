const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { loadSubcommands, dispatch } = require("../util/subcommands")
const CommandNamePresenter = require("../presenters/command-name-presenter")

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
    const savable_commands = require("./index").savable
    return {
      savable: CommandNamePresenter.list(savable_commands, opts.locale),
    }
  },
}
