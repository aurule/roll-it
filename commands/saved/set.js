const { SlashCommandSubcommandBuilder, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")
const { UserSavedRolls, saved_roll_schema } = require("../../db/saved_rolls")
const CommandNamePresenter = require("../../presenters/command-name-presenter")
const { parse } = require("../../parsers/invocation-parser")
const commonSchemas = require("../../util/common-schemas")
const { i18n } = require("../../locales")

/**
 * Validate that the given value is not in use as a name for a saved roll.
 *
 * This helper **requires** that the validation be run with a context including the `saved_rolls` attribute.
 *
 * @param  {str} value   Name to check
 * @param  {obj} helpers Joi helpers object with a context obj which includes saved_rolls
 * @return {str}         The value that was passed in
 */
function name_taken_validator(value, helpers) {
  if (helpers.prefs.context.saved_rolls.taken(value)) {
    return helpers.error("any.custom.unique")
  }

  return value
}

/**
 * Schema for validating incoming command options
 *
 * This repeats the validations performed by discord, with the addition of ensuring the name is not yet used
 * for a saved roll by this user in this guild.
 *
 * @type {Joi.object}
 */
const options_schema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .min(3)
    .max(100)
    .custom(name_taken_validator, "whether the name is in use")
    .messages({
      "any.custom.unique": oneLine`
        You already have a saved roll named "{#value}". You can pick a different name, or use
        ${inlineCode("/saved manage")} to remove the existing roll.
      `,
    }),
  description: commonSchemas.description,
  invocation: Joi.string().trim().optional().min(4).max(1500),
})

module.exports = {
  name: "set",
  parent: "saved",
  description: "Set the name and description of a saved roll",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Unique name for the saved roll")
          .setMinLength(3)
          .setMaxLength(100)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A few words about the saved roll")
          .setMinLength(3)
          .setMaxLength(1500)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("invocation")
          .setDescription("ADVANCED! Manually enter the discord command invocation to use")
          .setMinLength(4)
          .setMaxLength(1500)
          .setRequired(false),
      ),
  async execute(interaction) {
    // validate the name and description
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const t = i18n.getFixedT(interaction.locale, "commands", "saved.set")

    const raw_options = {
      name: interaction.options.getString("name"),
      description: interaction.options.getString("description"),
      invocation: interaction.options.getString("invocation") ?? undefined,
    }

    let command_options = {}
    try {
      command_options = await options_schema.validateAsync(raw_options, {
        context: { saved_rolls },
      })
    } catch (err) {
      return interaction.whisper(t("response.error.name", { message: err.details[0].message }))
    }

    // name, desc, and incomplete flag are the expected state
    const saved_roll_params = {
      name: command_options.name,
      description: command_options.description,
      incomplete: true,
      invalid: false,
    }

    // if there is an invocation, parse and validate it
    const invocation = command_options.invocation
    if (invocation) {
      let parsed_invocation
      try {
        parsed_invocation = await parse(invocation)
      } catch (err) {
        return interaction.whisper(t("response.error.invocation", { name: raw_options.name, message: err.message }))
      }

      // with a valid invocation, we can skip the incomplete flag and make a new saved roll directly
      saved_roll_params.command = parsed_invocation.command
      saved_roll_params.options = parsed_invocation.options
      saved_roll_params.incomplete = false
    }

    // let the db insert or update as appropriate
    // when new data is incomplete, an existing incomplete record will be created or updated
    // when new data is complete, a new record will be created
    saved_rolls.upsert(saved_roll_params)
    const saved_details = saved_rolls.detail(undefined, saved_roll_params.name)

    // see if the changes complete the saved roll
    try {
      await saved_roll_schema.validateAsync(saved_details)
    } catch {
      return interaction.whisper(t("response.partial", { name: command_options.name }))
    }

    // the roll is finished
    saved_rolls.update(saved_details.id, { incomplete: false })

    return interaction.whisper(t("response.complete", { name: command_options.name }))
  },
  help({ command_name, ...opts }) {
    const savable_commands = require("../index").savable
    return [
      oneLine`
        ${command_name} helps create a new saved roll for you on this server by setting the name and
        description. Then, you set the command and options for that roll by right clicking or long pressing on
        the result of a Roll It command and choosing ${italic("Apps -> Save this roll")}. Once you're
        finished, you can use ${inlineCode("/saved roll")} to roll it!
      `,
      "",
      oneLine`
        You can only have one unfinished roll at a time. That can either be a roll you just created, or a roll
        you are editing with ${inlineCode("/saved manage")}. Until you finish that roll, you will not be able
        to use it, nor will you be able to edit or create another saved roll.
      `,
      "",
      "Because saved rolls are stored by Roll It, each one of yours on the server has to have a unique name.",
      "",
      "Not all commands can be saved. Here is a list of the ones which can be used:",
      CommandNamePresenter.list(savable_commands),
      "",
      oneLine`
        For advanced usage, you can add an ${opts.invocation} when using ${command_name}. This lets you
        directly set the command and options that will be saved to the roll. An invocation looks like
        ${inlineCode("/roll pool:3 sides:6 rolls:2")} and is what Discord generates when you type out a
        command.
      `,
      "",
      oneLine`
        By adding an ${opts.invocation}, you can quickly create many saved rolls in a row. This will always
        save a new roll, even if you have one that is incomplete. As such, you ${italic("cannot")} use an
        ${opts.invocation} when editing a roll, as it will create a new saved roll instead.
      `,
    ].join("\n")
  },
}
