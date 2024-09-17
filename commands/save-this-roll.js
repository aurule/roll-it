const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  inlineCode,
  italic,
} = require("discord.js")
const { oneLine } = require("common-tags")

const { UserSavedRolls, saved_roll_schema } = require("../db/saved_rolls")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const interactionCache = require("../services/interaction-cache")

require("dotenv").config()
const botId = process.env.CLIENT_ID

module.exports = {
  name: "Save this roll",
  description: "Save a roll you've made to reuse it later",
  type: "menu",
  global: true,
  data: () =>
    new ContextMenuCommandBuilder()
      .setName(module.exports.name)
      .setType(ApplicationCommandType.Message),
  async execute(interaction) {
    const commands = require("./index")

    const message = interaction.targetMessage
    if (message.author.id != botId) {
      return interaction.whisper(
        "That message was not sent by a Roll It command."
      )
    }

    const cachedInvocation = interactionCache.findByMessage(interaction.targetMessage)
    if (!cachedInvocation) {
      return interaction.whisper("That message's command cannot be found, because the message may be too old. Try sending its command again, then saving the new message.")
    }

    const command = commands.get(cachedInvocation.commandName)
    if (!command.savable) {
      return interaction.whisper(
        `The command ${inlineCode(command.name)} cannot be saved.`
      )
    }

    let validated_options
    try {
      validated_options = await command.schema.validateAsync(cachedInvocation.options, { abortEarly: false })
    } catch (err) {
      return interaction.whisper(
        oneLine`
          That command's options cannot be saved, which means you found a bug! This is what went wrong while
          saving ${inlineCode(command.name)}:\n
        ` + err.details.map((d) => d.message).join("\n"),
      )
    }
    delete validated_options.description

    const saved_roll_params = {
      command: command.name,
      options: validated_options,
      incomplete: true,
      invalid: false,
    }

    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const record_result = saved_rolls.upsert(saved_roll_params)
    const record_id = record_result.lastInsertRowid
    const saved_details = saved_rolls.incomplete()

    // see if the changes complete the saved roll

    try {
      await saved_roll_schema.validateAsync(saved_details)
    } catch {
      return interaction.whisper(
        oneLine`
          You've saved the command for a new roll. Now use ${inlineCode("/saved set")} to set its name and
          description.
        `,
      )
    }

    // the roll is finished
    saved_rolls.update(record_id, { incomplete: false })

    return interaction.whisper(
      oneLine`
        You've saved the roll ${italic(saved_details.name)}! Try it out with
        ${inlineCode("/saved roll name:" + saved_details.name)}.
      `,
    )
  },
  help({ command_name }) {
    const savable_commands = require("./index").savable()
    return [
      oneLine`
        ${command_name} is a context menu command that helps create a new saved roll for you on this server.
        To use it, right click or long press on the result of a Roll It command and choose
        ${italic("Apps -> Save this roll")}. This will set the command and options for the saved roll. Then,
        you set the name and description using ${inlineCode("/saved set")}. Once you're finished, you can use
        ${inlineCode("/saved roll")} to roll it!
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
  },
}
