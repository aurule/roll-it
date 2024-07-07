const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")

const subcommands = loadSubcommands("tables")

module.exports = {
  name: "tables",
  description: "Add and manage rollable tables",
  global: true,
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand(subcommands.get("add").data())
      .addSubcommand(subcommands.get("manage").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help({ command_name }) {
    return [
      oneLine`
        Tables!
      `,
    ].join("\n")
  },
}
