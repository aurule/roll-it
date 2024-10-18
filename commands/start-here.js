const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js")
const { oneLine } = require("common-tags")

module.exports = {
  name: "start-here",
  description: "Set up Roll It for the first time",
  hidden: true,
  data() {
    return new SlashCommandBuilder()
    .setName(module.exports.name)
    .setDescription(module.exports.description)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  },
  async execute(interaction) {
    // deployed when bot is added to a guild
    // shows a welcome message, then invokes /setup systems
    // on error, it warns and remains
    // on nothing selected, it notifies and remains
    // on selection, it's automatically removed already, so just shows an explainer on using /setup commands
  },
  help({ command_name }) {
    return [
      "undefined",
    ].join("\n")
  }
}
