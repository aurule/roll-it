const { SlashCommandBuilder } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")

const subcommands = loadSubcommands("table")

module.exports = {
  name: "table",
  description: "Roll on a table, and manage which are available",
  global: false,
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
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
        Tables!
      `,
    ].join("\n")
  },
}
