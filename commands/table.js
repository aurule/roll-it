const { SlashCommandBuilder, italic, underscore } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const CommandChoicesTransformer = require("../transformers/command-choices-transformer")
const CommandHelpPresenter = require("../presenters/command-help-presenter")
const Topics = require("../help")
const { longReply } = require("../util/long-reply")
const {GuildRollables} = require("../db/rollable")

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
              .setAutocomplete(true)
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
      // only generate these when the guild has one or more tables in the database?
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
          ),
      )
  },
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const tables = new GuildRollables(interaction.guildId)

    var table_id

    switch(subcommand) {
      case "add":
        const name = interaction.options.getString("name")
        const description = interaction.options.getString("description")
        if (tables.taken(name)) {
          logger.error(`a table named "${name}" already exists`)
          return
        }
        const table_file = interaction.options.getAttachment("file")
        if (!table_file.contentType.includes("text/plain")) {
          logger.error(`this doesn't look like a text file: ${table_file.contentType}`)
          return
        }

        // reply with waiting message
        const contents = await fetch(table_file.url)
          .then((response) => response.text())
          .then((body) => body.trim().split(/\r?\n/))
        console.log(contents)

        if (contents.length < 2) {
          logger.error("not enough lines")
          return
        }

        return interaction.reply("adding")
        // validate
        // * attachment media type is text
        // * contents has at least two lines
        tables.create(name, description, contents)
        break;
      case "list":
        const available_tables = tables.all()
        return interaction.reply(`listing ${available_tables.length}`)
        // present the data
      case "manage":
        table_id = parseInt(interaction.options.getString("table"))
        if (!table_id) {
          logger.error("not an id")
          return
        }

        if (!tables.exists(table_id)) {
          logger.error(`table ${table_id} does not exist for guild ${tables.guildId}`)
          return
        }

        const table = tables.detail(table_id)
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
        table_id = parseInt(interaction.options.getString("table"))
        if (!table_id) {
          logger.error("not an id")
          return
        }

        if (!tables.exists(table_id)) {
          logger.error(`table ${table_id} does not exist for guild ${tables.guildId}`)
          return
        }

        const result = tables.random(table_id)
        return interaction.reply(`rolled "${result}"`)
        // present the result
    }
  },
  async autocomplete(interaction) {
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch(focusedOption.name) {
      case "table":
        // options for selecting a table
        // lookup is by name, value is the table's id
        return [{name: "placeholder", value: "1"}]
      case "name":
        const subcommand = interaction.options.getSubcommand()
        // options for a new or changed table name
        // if subcommand is "manage", add special "do not change" option
        // show user entry with a description of whether it's available or not
        return [{name: "new placeholder", value: "yes"}]
      case "description":
        // options for a changed table description
        // show user entry with a description of whether it's available or not
        return [{name: "some kind of descriptive text", value: "what he said"}]
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
