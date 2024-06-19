const { SlashCommandBuilder, italic, underscore } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const CommandChoicesTransformer = require("../transformers/command-choices-transformer")
const CommandHelpPresenter = require("../presenters/command-help-presenter")
const Topics = require("../help")
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
              .setDescription("The name for this table")
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
              .setDescription("A plain text file with the table's results, one per line.")
              .setRequired(true)
          ),
      )
      // only generate these when the guild has one or more tables in the database
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
              .setName("name")
              .setDescription("Name of the table to manage")
              .setRequired(true)
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("roll")
          .setDescription("Roll a random result from a table")
          .addStringOption(option =>
            option
              .setName("name")
              .setDescription("Name of the table to manage")
              .setRequired(true)
          ),
      )
  },
  execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    // const tables = rollable.forGuild(interaction.guildId)

    switch(subcommand) {
      case "add":
        return interaction.reply("adding")
        // need to ensure name is unique within the guild
        // validate that the attachment media type is text and that it has at least two lines
        tables.create(table_name, table_description, table_file)
        // update guild's table commands with the new table options
        //   this avoids the need for an autocompleter
        break;
      case "list":
        return interaction.reply("listing")
        const rollables = tables.all()
        // present the names and descriptions of each rollable
        break;
      case "manage":
        return interaction.reply("managing")
        // interactive stuff
        break;
      case "roll":
        return interaction.reply("rolling")
        const table_id = interaction.options.getString("name")
        const sides = tables.getCount(table_id)
        // roll 1 sides
        const line = tables.getLine(table_id, roll_result)
        // present the line
        break;
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
