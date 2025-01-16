const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const { presentList } = require("../../presenters/table-list-presenter")
const { GuildRollables } = require("../../db/rollable")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

const command_name = "list"
const parent_name = "table"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () => new LocalizedSubcommandBuilder(command_name, parent_name),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const t = i18n.getFixedT(interaction.locale, "commands", "table.list")

    const full_text = presentList(tables.all(), t)
    return interaction.paginate({
      content: full_text,
      split_on: "\n",
      secret: true,
    })
  },
}
