const { SlashCommandSubcommandBuilder } = require("discord.js")
const { presentList } = require("../../presenters/table-list-presenter")
const { longReply } = require("../../util/long-reply")
const { GuildRollables } = require("../../db/rollable")

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

    const full_text = presentList(tables.all())

    return longReply(interaction, full_text, { separator: "\n", ephemeral: true })
  },
  help({ command_name }) {
    return `${command_name} IS A TEMPLATE.`
  },
}
