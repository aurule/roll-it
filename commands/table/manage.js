const { SlashCommandSubcommandBuilder } = require("discord.js")
const Completers = require("../../completers/table-completers")
const { GuildRollables } = require("../../db/rollable")

module.exports = {
  name: "manage",
  parent: "table",
  description: "Explain, change, or remove a table",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("table")
          .setDescription("Name of the table to manage")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const table_name = interaction.options.getString("table")
    const table_id = parseInt(table_name)

    const detail = tables.detail(table_id, table_name)

    if (detail === undefined) {
      return interaction.reply({
        content:
          "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
        ephemeral: true,
      })
    }

    return interaction.reply(`managing table ${table.name}`)
    // show a prompt with the table name and description, probably also die size
    // ask the user what they want to do:
    // * show the table's contents
    //  - followup by presenting the stored contents
    // * update the table
    //  - prompt for a new name, description, and attachment
    //  - name and desc are selectable and have a "do not change" option
    //    + name autocompleter shows whatever the user enters with a description of whether it's available or not
    // * remove the table
    //  - chicken switch, then tables.destroy(table_id)
  },
  async autocomplete(interaction) {
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch (focusedOption.name) {
      case "table":
        return Completers.table(partialText, tables.all())
    }
  },
  help({ command_name }) {
    return `${command_name} IS A TEMPLATE.`
  },
}
