const { SlashCommandSubcommandBuilder, inlineCode, userMention, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")
const { GuildRollables } = require("../../db/rollable")
const { fetchLines } = require("../../util/attachment-lines")

const MAX_UPLOAD_SIZE = 5_242_880

module.exports = {
  name: "add",
  parent: "table",
  description: "Upload a new rollable table",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option.setName("name").setDescription("The name for the table").setMinLength(3).setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A few words about the table")
          .setMinLength(3)
          .setRequired(true),
      )
      .addAttachmentOption((option) =>
        option
          .setName("file")
          .setDescription("A plain text file with the table's entries, one per line. Keep it under 5 MB.")
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option.setName("quiet").setDescription("Hide the new table announcement from other users"),
      ),
  async execute(interaction) {
    interaction.deferReply()
    const tables = new GuildRollables(interaction.guildId)

    const name_taken_validator = (value, helpers) => {
      if (tables.taken(value)) {
        return helpers.error("any.custom.unique")
      }

      return value
    }

    const options_schema = Joi.object({
      table_name: Joi.string()
        .trim()
        .required()
        .min(3)
        .custom(name_taken_validator, "whether the name is in use")
        .messages({
          "any.custom.unique": oneLine`
            There is already a table named "{#value}". You can pick a different name, or use
            ${inlineCode("/table manage")} to remove the existing table.
          `
        }),
      description: Joi.string()
        .trim()
        .required()
        .min(3),
      secret: Joi.boolean(),
      table_file: Joi.object({
        contentType: Joi.string()
          .valid("text/plain")
          .required()
          .messages({
            "any.only": oneLine`
              The file you uploaded does not look like a plain text file. Try again using a plain, basic text
              file (save as ${inlineCode(".txt")}) with one result per line (when word wrap is turned off).
            `
          }),
        size: Joi.number()
          .required()
          .max(MAX_UPLOAD_SIZE)
            .message("The file you uploaded is too large. Make sure your file is less than 5 MB."),
        contents: Joi.string().optional(), //for testing
      })
        .unknown()
    })

    const contents_schema = Joi.array()
      .items(
        Joi.string()
          .max(1500)
            .message("At least one of the table entries is too long. Keep each one below 1500 characters.")
          .trim()
      )
      .min(2)
        .message("The file you uploaded does not have enough lines. Ensure there are at least two lines of text in the file.")
      .required()

    const raw_options = {
      table_name: interaction.options.getString("name"),
      description: interaction.options.getString("description"),
      secret: interaction.options.getBoolean("quiet"),
      table_file: interaction.options.getAttachment("file"),
    }

    let normalized_options
    try {
      normalized_options = await options_schema.validateAsync(raw_options)
    } catch(err) {
      return interaction.editReply({
        content: err.details[0].message,
        ephemeral: true,
      })
    }

    const {table_name, description, secret, table_file} = normalized_options

    let contents
    const initial_contents = await fetchLines(table_file)
    try {
      contents = await contents_schema.validateAsync(initial_contents)
    } catch(err) {
      return interaction.editReply({
        content: err.details[0].message,
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
    return [
      oneLine`
        ${command_name} creates a new rollable table on this server. Once added, you can use
        ${inlineCode("/table roll")} to get a random result from its entries.
      `,
    ].join("\n")
  },
}
