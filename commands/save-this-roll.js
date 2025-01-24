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
const { canonical, mapped } = require("../locales/helpers")

require("dotenv").config()
const botId = process.env.CLIENT_ID

const command_id = "save-this-roll"

module.exports = {
  id: command_id,
  name: canonical("name", command_id),
  description: canonical("description", command_id),
  type: "menu",
  global: true,
  data: () =>
    new ContextMenuCommandBuilder()
      .setName(canonical("name", command_id))
      .setNameLocalizations(mapped("name", command_id))
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
      return interaction.whisper(
        t("validation.options", {
          command,
          messages: err.details.map((d) => d.message).join("\n"),
        }),
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
      return interaction.whisper(t("response.incomplete"))
    }

    // the roll is finished
    saved_rolls.update(record_id, { incomplete: false })

    return interaction.whisper(t("response.complete", { saved_details }))
  },
  help_data(opts) {
    const savable_commands = require("./index").savable
    return {
      savable: CommandNamePresenter.list(savable_commands, opts.locale),
    }
  },
}
