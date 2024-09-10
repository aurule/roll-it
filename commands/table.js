const { SlashCommandBuilder, PermissionFlagsBits, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")
const { siteLink } = require("../util/site-link")

const subcommands = loadSubcommands("table")

module.exports = {
  name: "table",
  description: "Add, manage, and roll on random tables",
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
      italic(oneLine`
        You can also read about ${siteLink("Random Tables", "/tables")} on the Roll It Website.
      `),
      "",
      oneLine`
        The ${command_name} commands let you create and roll random results from a table. Each subcommand has
        its own help entry you can read for more details.
      `,
      "",
      oneLine`
        In general, you'll use ${inlineCode("/table add")} to create one or more tables, then
        ${inlineCode("/table roll")} to get a random entry from one of them.
      `,
      "",
      `You can use ${inlineCode("/table list")} to see which tables are available.`,
      "",
      oneLine`
        ${inlineCode("/table manage")} lets you see the details and full contents of a table, as well as
        remove it from the server. If you need to change something about a table, like tweak its name or
        change an entry, you'll have to remove the table and then add it back with the desired changes.
      `,
    ].join("\n")
  },
}
