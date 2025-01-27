const { PermissionFlagsBits } = require("discord.js")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { loadSubcommands, dispatch } = require("../util/subcommands")
const { siteLink } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "table"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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
