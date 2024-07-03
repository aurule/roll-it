const { SlashCommandSubcommandBuilder, inlineCode, userMention, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const { GuildRollables } = require("../../db/rollable")
const { fetchLines } = require("../../util/attachment-lines")

module.exports = {
  name: "add",
  parent: "table",
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
      ),
  async execute(interaction) {
    interaction.deferReply()
    const tables = new GuildRollables(interaction.guildId)

    const table_name = interaction.options.getString("name") ?? ""
    const description = interaction.options.getString("description") ?? ""

    if (tables.taken(table_name)) {
      return interaction.editReply({
        content: oneLine`
          There is already a table named "${table_name}". You can use ${inlineCode("/table manage")} to change
          its contents, or pick a different name.
        `,
        ephemeral: true,
      })
    }

    const table_file = interaction.options.getAttachment("file")

    if (!table_file.contentType.includes("text/plain")) {
      return interaction.editReply({
        content: oneLine`
          The file you uploaded doesn't look like it's plain text. As a reminder, it must be a plain text file
          with one result per line (when word wrap is turned off).
        `,
        ephemeral: true,
      })
    }

    const contents = fetchLines(table_file)

    if (contents.length < 2) {
      return interaction.editReply({
        content: oneLine`
          The file you uploaded doesn't have enough lines. Ensure there are at least two lines of text in the
          file, preferably more, or it isn't much of a table.
        `,
        ephemeral: true,
      })
    }

    tables.create(table_name, description, contents)
    return interaction.editReply(
      oneLine`
        ${userMention(interaction.user.id)} created the table ${italic(table_name)}! You can roll on it with
        ${inlineCode("/table roll")}.
      `,
    )
  },
  help({ command_name }) {
    return `${command_name} IS A TEMPLATE.`
  },
}
