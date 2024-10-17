const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")

const subcommands = loadSubcommands("setup")

module.exports = {
  name: "setup",
  description: "Set up Roll It with the commands you need",
  subcommands,
  // global: true,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand(subcommands.get("commands").data())
      .addSubcommand(subcommands.get("systems").data())
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
        The ${command_name} commands let you set which roll commands are present on your server. Use
        ${inlineCode("/setup systems")} to set recommended commands based on the game systems you're using.
        Or, use ${inlineCode("/setup commands")} to pick commands individually.
      `,
    ].join("\n")
  },
}
