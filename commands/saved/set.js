const { SlashCommandSubcommandBuilder, inlineCode, userMention, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")
const { UserSavedRolls } = require("../../db/saved_rolls")
const { fetchLines } = require("../../util/attachment-lines")
const CommandNamePresenter = require("../../presenters/command-name-presenter")
const { parse } = require("../../parsers/invocation-parser")
const commonSchemas = require("../../util/common-schemas")

const MAX_UPLOAD_SIZE = 5_242_880
const MAX_ENTRY_LENGTH = 1500

module.exports = {
  name: "set",
  parent: "saved",
  description: "Save a roll command and its options",
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
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A few words about the saved roll")
          .setMinLength(3)
          .setMaxLength(1500)
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("invocation")
          .setDescription("ADVANCED! Manually enter the discord command invocation to use")
          .setMinLength(4)
          .setMaxLength(1500)
          .setRequired(false)
      ),
  async execute(interaction) {
    interaction.deferReply()

    const savable_commands = require("../index").savable()
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const name_taken_validator = (value, helpers) => {
      if (saved_rolls.taken(value)) {
        return helpers.error("any.custom.unique")
      }

      return value
    }

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
      invocation: Joi.string()
        .trim()
        .optional()
        .min(4)
        .max(1500),
    })

    const raw_options = {
      name: interaction.options.getString("name"),
      description: interaction.options.getString("description"),
      invocation: interaction.options.getString("invocation"),
    }

    let command_options = {}
    try {
      command_options = await options_schema.validateAsync(raw_options)
    } catch (err) {
      return interaction.editReply({
        content: err.details[0].message,
        ephemeral: true,
      })
    }

    const saved_roll_params = {
      ...command_options,
      incomplete: true
    }

    const invocation = command_options.invocation
    if (invocation) {
      const parsed_invocation = parse(invocation)

      if (parsed_invocation.errors.length) {
        return interaction.editReply({
          content: parsed_invocation.errors.join("\n"),
          ephemeral: true
        })
      }

      const schema = savable_commands.get(parsed_invocation.command).schema
      var validated_options
      try {
        validated_options = await schema.validateAsync(parsed_invocation.options)
      } catch (err) {
        return interaction.editReply({
          content: err.details[0].message,
          ephemeral: true,
        })
      }

      saved_roll_params.command = parsed_invocation.command
      saved_roll_params.options = validated_options
      saved_roll_params.incomplete = false

    }

    // TODO upsert
    saved_rolls.create(saved_roll_params)
    let response_content
    if (saved_roll_params.incomplete) {
      response_content = oneLine`
        You've saved the name ${italic(command_options.name)} for a new roll. Right click on the result of a
        roll you make and choose ${inlineCode("Apps -> Save this roll")} to add that command and its options
        to ${italic(command_options.name)}.
      `
    } else {
      response_content = oneLine`
        You've saved the roll ${italic(command_options.name)}. Try it out with
        ${inlineCode("/saved roll name:" + command_options.name)}!
      `
    }
    return interaction.editReply({
      content: response_content,
      ephemeral: true,
    })
  },
  help({ command_name }) {
    const savable_commands = require("../index").savable()
    return [
      oneLine`
        ${command_name} creates a new saved roll for you on this server. It has two steps. First, you set the
        name and description, and choose the command to use. Second, you set the options for that command.
        Once you're finished, you can use ${inlineCode("/saved roll")} to roll it!
      `,
      "",
      oneLine`
        You can only have one unfinished roll at a time. That can either be a roll you just created, or a roll
        you are editing with ${inlineCode("/saved manage")}. Until you finish that roll's options, you will not
        be able to use it, nor will you be able to edit or create another saved roll.
      `,
      "",
      "Because saved rolls are stored by Roll It, they have some limitations beyond what Discord requires:",
      oneLine`
        1. Each of your rolls on a server has to have a unique name. You'll get an error if you try to use one
        twice.
      `,
      "2. The name and description both have to be at least three characters long.",
      "3. Not all commands can be saved. Below is a list of the ones which can be used.",
      "",
      "Savable commands:",
      CommandNamePresenter.list(savable_commands)
    ].join("\n")
  },
}
