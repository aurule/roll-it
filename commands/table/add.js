const { SlashCommandSubcommandBuilder, inlineCode, userMention, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")
const { GuildRollables } = require("../../db/rollable")
const { fetchLines } = require("../../util/attachment-lines")

const MAX_UPLOAD_SIZE = 5_242_880
const MAX_ENTRY_LENGTH = 1500

/**
 * Validate that a given value is not in use as a name for a rollable in this server
 *
 *
 * This helper **requires** that the validation be run with a context including the `tables` attribute.
 *
 * @param  {str} value   Name to check
 * @param  {obj} helpers Joi helpers object with a context obj which includes tables
 * @return {str}         The value that was passed in
 */
function name_taken_validator(value, helpers) {
  if (helpers.prefs.context.tables.taken(value)) {
    return helpers.error("any.custom.unique")
  }

  return value
}

/**
 * Schema for validating incoming command options
 *
 * This repeats the validations performed by discord, with some additions:
 * 1. The name is not yet used for a table in this guild.
 * 2. The uploaded file is a text file and under 5MB
 *
 * @type {Joi.object}
 */
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
      `,
    }),
  description: Joi.string().trim().required().min(3),
  secret: Joi.boolean(),
  table_file: Joi.object({
    contentType: Joi.string()
      .valid("text/plain")
      .required()
      .messages({
        "any.only": oneLine`
          The file you uploaded does not look like a plain text file. Try again using a plain, basic text
          file (save as ${inlineCode(".txt")}) with one result per line (when word wrap is turned off).
        `,
      }),
    size: Joi.number()
      .required()
      .max(MAX_UPLOAD_SIZE)
      .message("The file you uploaded is too large. Make sure your file is less than 5 MB."),
    contents: Joi.string().optional(), //for testing
  }).unknown(),
})

/**
 * Schema for validating the uploaded file's contents
 *
 * It ensures that each line is under 1500 characters long and that there are at least two lines.
 *
 * @type {Joi.object}
 */
const contents_schema = Joi.array()
  .items(
    Joi.string()
      .max(MAX_ENTRY_LENGTH)
      .message(
        `At least one of the table entries is too long. Keep each one below ${MAX_ENTRY_LENGTH} characters.`,
      )
      .trim(),
  )
  .min(2)
  .message(
    "The file you uploaded does not have enough lines. Ensure there are at least two lines of text in the file.",
  )
  .required()

module.exports = {
  name: "add",
  parent: "table",
  description: "Upload a new rollable table",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Unique name for the table")
          .setMinLength(3)
          .setRequired(true),
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
          .setDescription(
            "A plain text file with the table's entries, one per line. Keep it under 5 MB.",
          )
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option.setName("quiet").setDescription("Hide the new table announcement from other users"),
      ),
  async execute(interaction) {
    interaction.deferReply()
    const tables = new GuildRollables(interaction.guildId)

    const raw_options = {
      table_name: interaction.options.getString("name"),
      description: interaction.options.getString("description"),
      secret: interaction.options.getBoolean("quiet"),
      table_file: interaction.options.getAttachment("file"),
    }

    let normalized_options
    try {
      normalized_options = await options_schema.validateAsync(raw_options, {context: {tables}})
    } catch (err) {
      return interaction.editReply({
        content: err.details[0].message,
        ephemeral: true,
      })
    }

    const { table_name, description, secret, table_file } = normalized_options

    let contents
    const initial_contents = await fetchLines(table_file)
    try {
      contents = await contents_schema.validateAsync(initial_contents)
    } catch (err) {
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
      "",
      oneLine`
        When adding a table, you have to upload a text file containing the table's entries. Each line of the
        file will become a single entry in the table. Be careful that you don't leave any blank lines, titles,
        or other notes in the file that you use, because these ${italic("will")} show up as entries in the
        table.
      `,
      "",
      oneLine`
        If you aren't sure you that your file is a plain text file, open it with your text editor of choice
        and save it as ${inlineCode("Plain Text")} with the extension ${inlineCode(".txt")}.
      `,
      "",
      "Because tables are stored by Roll It, they have some limitations beyond what Discord requires:",
      "1. Each table on a server has to have a unique name. You'll get an error if it's taken.",
      "2. The name and description both have to be at least three characters long.",
      oneLine`
        3. The entries file has to have at least two lines, and has to be smaller than 5 megabytes. That's
        roughly the size of a full-length novel.
      `,
      `4. Each entry must be less than ${MAX_ENTRY_LENGTH} characters.`,
    ].join("\n")
  },
}
