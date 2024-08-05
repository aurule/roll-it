const { ContextMenuCommandBuilder, ApplicationCommandType, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")
const { UserSavedRolls } = require("../db/saved_rolls")
const CommandNamePresenter = require("../presenters/command-name-presenter")

/**
 * Minimal schema to validate presence. Correctness must be validated before we reach this point.
 *
 * @type {Joi.object}
 */
const saved_roll_presence_schema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  command: Joi.string().required(),
  options: Joi.object().required(),
}).unknown()

module.exports = {
  name: "Save this roll",
  description: "Save a roll you've made to reuse it later",
  type: "menu",
  // global: true,
  global: false,
  data: () =>
    new ContextMenuCommandBuilder()
      .setName(module.exports.name)
      .setType(ApplicationCommandType.Message),
  async execute(interaction) {
    const commands = require("./index")
    const parsers = require("../parsers")

    const message = interaction.targetMessage
    const command_name = message.interaction?.commandName
    const command = commands.get(command_name)

    if (!command) {
      return interaction.reply({
        content: "That message was not sent by a Roll It command.",
        ephemeral: true,
      })
    }

    if (!command.savable) {
      return interaction.reply({
        content: `The command ${inlineCode(command_name)} cannot be saved.`,
        ephemeral: true,
      })
    }

    const parser = parsers.get(command_name)
    if (!parser) {
      return interaction.reply({
        content: oneLine`
          You found a bug! There is no parser for the options of ${inlineCode(command_name)}, but there should be.
          Please report this error if you can.
        `,
        ephemeral: true,
      })
    }

    let parsed_options
    try {
      parsed_options = await parser.parse(message.content)
    } catch(err) {
      return interaction.reply({
        content: `There was a problem saving ${inlineCode(command_name)}:\n` + err.message,
        ephemeral: true,
      })
    }

    const saved_roll_params = {
      command: command_name,
      options: parsed_options,
      incomplete: true,
    }

    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const record_result = saved_rolls.upsert(saved_roll_params)
    const record_id = record_result.lastInsertRowid
    const saved_details = saved_rolls.detail(record_id)

    // see if the changes complete the saved roll

    try {
      await saved_roll_presence_schema.validateAsync(saved_details)
    } catch (err) {
      return interaction.reply({
        content: oneLine`
          You've saved the command for a new roll. Now use ${inlineCode("/saved set")} to set its name and
          description.
        `,
        ephemeral: true,
      })
    }

    // the roll is finished
    saved_rolls.update(record_id, {incomplete: false})

    return interaction.reply({
      content: oneLine`
        You've saved the roll ${italic(saved_details.name)}! Try it out with
        ${inlineCode("/saved roll name:" + saved_details.name)}.
      `,
      ephemeral: true,
    })
  },
  help({ command_name }) {
    const savable_commands = require("./index").savable()
    return [
      oneLine`
        ${command_name} helps create a new saved roll for you on this server by setting the command and
        options. Then, you set the name and description using ${inlineCode("/saved set")}. Once you're
        finished, you can use ${inlineCode("/saved roll")} to roll it!
      `,
      "",
      oneLine`
        You can only have one unfinished roll at a time. That can either be a roll you just created, or a roll
        you are editing with ${inlineCode("/saved manage")}. Until you finish that roll's options, you will not
        be able to use it, nor will you be able to edit or create another saved roll.
      `,
      "",
      "Not all commands can be saved. Here is a list of the ones which can be used:",
      CommandNamePresenter.list(savable_commands),
    ].join("\n")
  }
}