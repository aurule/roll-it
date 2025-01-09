const { SlashCommandSubcommandBuilder, MessageFlags } = require("discord.js")
const { presentList } = require("../../presenters/table-list-presenter")
const { GuildRollables } = require("../../db/rollable")
const { i18n } = require("../../locales")

module.exports = {
  name: "list",
  parent: "table",
  description: "List the tables on this server",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const t = i18n.getFixedT(interaction.locale, "commands", "table.list")

    const full_text = presentList(tables.all(), t)
    return interaction.paginate({
      content: full_text,
      split_on: "\n",
      ephemeral: true,
    })
  },
  help({ command_name }) {
    return `${command_name} shows the tables that are available on this server.`
  },
}
