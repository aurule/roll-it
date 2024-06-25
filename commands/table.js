const { SlashCommandBuilder, inlineCode, userMention } = require("discord.js")
const { oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { GuildRollables } = require("../db/rollable")
const Completers = require("../completers/table-completers")
const { present } = require("../presenters/table-results-presenter")
const commonOpts = require("../util/common-options")
const { longReply } = require("../util/long-reply")

module.exports = {
  name: "table",
  description: "Roll on a table, and manage which are available",
  global: false,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Upload a new rollable table")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("The name for the table")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("description")
              .setDescription("A few words about the table")
              .setRequired(true)
          )
          .addAttachmentOption((option) =>
            option
              .setName("file")
              .setDescription("A plain text file with the table's results, one per line")
              .setRequired(true)
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription("List the tables on this server")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("manage")
          .setDescription("Explain, change, or remove a table")
          .addStringOption(option =>
            option
              .setName("table")
              .setDescription("Name of the table to manage")
              .setRequired(true)
              .setAutocomplete(true)
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("roll")
          .setDescription("Roll a random result from a table")
          .addStringOption(option =>
            option
              .setName("table")
              .setDescription("Name of the table to manage")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addStringOption(commonOpts.description)
          .addIntegerOption(commonOpts.rolls)
          .addBooleanOption(commonOpts.secret),
      )
  },
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const tables = new GuildRollables(interaction.guildId)

    var table_id
    var table_name
    var detail
    var full_text

    switch(subcommand) {
      case "add":
        const name = interaction.options.getString("name")
        const description = interaction.options.getString("description")
        if (tables.taken(name)) {
          return interaction.reply({
            content: `There is already a table named "${name}". You can use ${inlineCode("/table manage")} to change its contents, or pick a different name.`,
            ephemeral: true,
          })
        }
        const table_file = interaction.options.getAttachment("file")
        if (!table_file.contentType.includes("text/plain")) {
          return interaction.reply({
            content: "The file you uploaded doesn't look like it's plain text. As a reminder, it should be in plain text with one result per line (when word wrap is turned off).",
            ephemeral: true,
          })
        }

        interaction.deferUpdate()
        const contents = await fetch(table_file.url)
          .then((response) => response.text())
          .then((body) => body.trim().split(/\r?\n/))

        if (contents.length < 2) {
          return interaction.followUp({
            content: "The file you uploaded doesn't have enough lines. Ensure there are at least two lines of text in the file, preferably more, or it isn't much of a table.",
            ephemeral: true,
          })
        }

        tables.create(name, description, contents)
        return interaction.followUp(`${userMention(interaction.user.id)} created the table "${name}"! You can roll on it with ${inlineCode("/table roll")}.`)
      case "list":
        full_text = presentList(tables.all())
        return longReply(interaction, full_text, {separator: "\n", ephemeral: true})
      case "manage":
        table_name = interaction.options.getString("table")
        table_id = parseInt(table_name)

        detail = tables.detail(table_id, table_name)

        if (detail === undefined) {
          return interaction.reply({
            content: "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
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
      case "roll":
        const rolls = interaction.options.getInteger("rolls") ?? 1
        const roll_description = interaction.options.getString("description") ?? ""
        const ephemeral = interaction.options.getBoolean("secret") ?? false
        table_name = interaction.options.getString("table")
        table_id = parseInt(table_name)

        const results = Array.from({length: rolls}, (v) => tables.random(table_id, table_name))

        if (results[0] === undefined) {
          return interaction.reply({
            content: "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
            ephemeral: true,
          })
        }

        detail = tables.detail(table_id, table_name)

        full_text = present({
          userFlake: interaction.user.id,
          rolls,
          tableName: detail.name,
          results,
          description: roll_description,
        })
        return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
    }
  },
  async autocomplete(interaction) {
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch(focusedOption.name) {
      case "table":
        return Completers.table(partialText, tables.all())
    }
  },
  help({ command_name }) {
    return [
      oneLine`
        Tables!
      `,
    ].join("\n")
  },
}
