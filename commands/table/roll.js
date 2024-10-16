const { SlashCommandSubcommandBuilder } = require("discord.js")
const Completers = require("../../completers/table-completers")
const { present } = require("../../presenters/table-results-presenter")
const { GuildRollables } = require("../../db/rollable")

const commonOpts = require("../../util/common-options")

module.exports = {
  name: "roll",
  parent: "table",
  description: "Roll a random entry from a table",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("table")
          .setDescription("Name of the table to roll")
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const table_name = interaction.options.getString("table") ?? "0"
    const table_id = parseInt(table_name)

    const results = Array.from({ length: rolls }, () => tables.random(table_id, table_name))

    if (results[0] === undefined) {
      return interaction.whisper(
        "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
      )
    }

    const detail = tables.detail(table_id, table_name)

    const full_text = present({
      userFlake: interaction.user.id,
      rolls,
      tableName: detail.name,
      results,
      description: roll_description,
    })
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      ephemeral: secret,
    })
  },
  async autocomplete(interaction) {
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "table":
        return Completers.table(partialText, tables.all())
    }
  },
  help({ command_name }) {
    return `${command_name} gets a random entry from a table on this server.`
  },
}
