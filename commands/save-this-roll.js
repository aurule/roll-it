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
const { i18n } = require("../locales")

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

    const t = i18n.getFixedT(interaction.locale, "commands", "save-this-roll")

    const message = interaction.targetMessage
    if (message.author.id != botId) {
      return interaction.whisper(t("validation.foreign"))
    }

    const cachedInvocation = interactionCache.findByMessage(interaction.targetMessage)
    if (!cachedInvocation) {
      return interaction.whisper(t("validation.missing"))
    }

    const command = commands.get(cachedInvocation.commandName)
    if (!command.savable) {
      return interaction.whisper(t("validation.unsavable", { command }))
    }

    let validated_options
    try {
      validated_options = await command.schema.validateAsync(cachedInvocation.options, {
        abortEarly: false,
      })
    } catch (err) {
      return interaction.whisper(t("validation.options", { command, messages: err.details.map((d) => d.message).join("\n")}))
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
      return interaction.whisper(t("response.incomplete"))
    }

    // the roll is finished
    saved_rolls.update(record_id, { incomplete: false })

    return interaction.whisper(t("response.complete", { saved_details }))
  },
  help({ command_name }) {
    const savable_commands = require("./index").savable
    return [
      oneLine`
        ${command_name} is a context menu command that helps create a new saved roll for you on this server.
        To use it, right click or long press on the result of a recent Roll It command and choose
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
