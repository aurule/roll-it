const { SlashCommandBuilder, italic, underscore } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

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
  execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const tables = new GuildRollables(interaction.guildId)

    switch(subcommand) {
      case "add":
        return interaction.reply("adding")
        // autocompleter for name
        const name = interaction.options.getString("name")
        const description = interaction.options.getString("description")
        // validate
        // * name is unique within the guild with tables.taken(name)
        // * attachment media type is text
        const contents = interaction.options.getAttachment("file")
        // validate
        // * contents has at least two lines
        tables.create(name, description, contents)
        // update guild's table commands with the new table options
        //   this avoids the need for an autocompleter
        break;
      case "list":
        return interaction.reply("listing")
        const available_tables = tables.all()
        // present the data
        break;
      case "manage":
        return interaction.reply("managing")
        // autocompleter for name
        // const table_id = ???
        // validate that the name exists
        const table = tables.detail(table_id)
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
        break;
      case "roll":
        return interaction.reply("rolling")
        // autocompleter for name
        // const table_id = ???
        // validate that the name exists
        const result = tables.random(table_id)
        // present the result
        break;
    }
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)

    switch(focusedOption.name) {
      case "table":
        // options for selecting a table
        // lookup is by name, value is the table's id
        return [{name: "placeholder", value: "yes"}]
      case "name":
        // options for a new or changed table name
        // can include a "do not change" option for the Manage command
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
