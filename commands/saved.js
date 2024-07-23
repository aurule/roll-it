const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")

const subcommands = loadSubcommands("saved")

module.exports = {
  name: "saved",
  description: "Save your most common rolls and re-use them",
  global: false,
  // global: true,
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
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
  help({ command_name }) {
    return [
      oneLine`
        The ${command_name} commands let you save commonly used rolls and easily re-use them. Certain commands
        cannot be saved, but most will work. Each subcommand has its own help entry you can read for more
        details.
      `,
      "",
      oneLine`
        In general, you'll use ${inlineCode("/saved add")} to save one or more rolls and their options. Then,
        ${inlineCode("/saved roll")} to use one of them.
      `,
      "",
      `You can use ${inlineCode("/saved list")} to see the rolls you've saved on this server.`,
      "",
      oneLine`
        ${inlineCode("/saved manage")} lets you see the details of a saved roll, update its options, and
        remove it from the server.
      `,
    ].join("\n")
  },
}
