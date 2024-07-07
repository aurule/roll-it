const { SlashCommandSubcommandBuilder, inlineCode, userMention, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const { GuildRollables } = require("../../db/rollable")
const { fetchLines } = require("../../util/attachment-lines")

module.exports = {
  name: "add",
  parent: "tables",
  description: "Upload a new rollable table",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option.setName("name").setDescription("The name for the table").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A few words about the table")
          .setRequired(true),
      )
      .addAttachmentOption((option) =>
        option
          .setName("file")
          .setDescription("A plain text file with the table's results, one per line")
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option.setName("quiet").setDescription("Hide the new table announcement from other users"),
      ),
  async execute(interaction) {
    interaction.deferReply()
    const tables = new GuildRollables(interaction.guildId)

    const table_name = interaction.options.getString("name") ?? ""
    const description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("quiet") ?? false

    if (tables.taken(table_name)) {
      return interaction.editReply({
        content: oneLine`
          There is already a table named "${table_name}". You can pick a different name, or use
          ${inlineCode("/table manage")} to change the existing table.
        `,
        ephemeral: true,
      })
    }

    const table_file = interaction.options.getAttachment("file")

    if (!table_file.contentType.includes("text/plain")) {
      return interaction.editReply({
        content: oneLine`
          The file you uploaded does not look like a plain text file. Try again using a plain, basic text file
          (save as ${inlineCode(".txt")}) with one result per line (when word wrap is turned off).
        `,
        ephemeral: true,
      })
    }

    const contents = fetchLines(table_file)

    if (contents.length < 2) {
      return interaction.editReply({
        content: oneLine`
          The file you uploaded does not have enough lines. Ensure there are at least two lines of text in the
          file.
        `,
        ephemeral: true,
      })
    }

    tables.create(table_name, description, contents)
    return interaction.editReply({
      content: oneLine`
        ${userMention(interaction.user.id)} created the table ${italic(table_name)}! You can roll on it with
        ${inlineCode("/table roll")}.
      `,
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return `${command_name} IS A TEMPLATE.`
  },
}
