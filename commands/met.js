const { SlashCommandBuilder, PermissionFlagsBits, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")
const { siteLink } = require("../util/site-link")

const subcommands = loadSubcommands("met")

module.exports = {
  name: "met",
  description: "Roll rock-paper-scissors for MET, or start an opposed test",
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand(subcommands.get("static").data())
      .addSubcommand(subcommands.get("opposed").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help({ command_name }) {
    return [
      "undefined",
    ].join("\n")
  },
}
