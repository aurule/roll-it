const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js")

const { UserSavedRolls, saved_roll_schema } = require("../db/saved_rolls")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const interactionCache = require("../services/interaction-cache")
const { i18n } = require("../locales")
const { canonical, mapped } = require("../locales/helpers")
const rollCache = require("../services/roll-cache")
const SavedRollModal = require("../modals/saved-roll")

require("dotenv").config({ quiet: true })
const botId = process.env.CLIENT_ID

const command_id = "save-this-roll"

module.exports = {
  i18nId: command_id,
  name: canonical("name", command_id),
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

    const cachedInvocation = await interactionCache.getMessage(interaction.targetMessage)
    if (!cachedInvocation) {
      return interaction.whisper(t("validation.missing"))
    }

    const command = commands.get(cachedInvocation.commandName)
    if (!command.savable) {
      const presented = CommandNamePresenter.present(command, interaction.locale)
      return interaction.whisper(t("validation.unsavable", { presented }))
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

    const modal = SavedRollModal.data("create", interaction.locale, {
      description: validated_options.description,
    })
    delete validated_options.description

    const cache_data = {
      command: command.name,
      options: validated_options,
    }
    await rollCache.set(interaction, cache_data)

    return interaction.showModal(modal)
  },
  help_data(opts) {
    const savable_commands = require("./index").sorted.savable.get(opts.locale)
    return {
      savable: CommandNamePresenter.list(savable_commands, opts.locale),
    }
  },
}
