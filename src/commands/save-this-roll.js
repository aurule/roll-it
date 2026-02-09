import { ApplicationCommandType } from "discord.js"

import { present as presentCommand, list as listCommands } from "../presenters/command-name-presenter.js"
import interactionCache from "../services/interaction-cache.js"
import { canonical } from "../locales/helpers.js"
import rollCache from "../services/roll-cache.js"
import { SavedRollModal } from "../modals/saved-roll.js"
import { commands, sortedCommands } from "./index.js"
import { ContextCommand } from "./abstract/context-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the save roll command
 */
export class SaveThisRoll extends ContextCommand {
  static i18nId = "save-this-roll"
  static name = canonical("name", this.i18nId)
  static global = true

  static data() {
    return this.builder
      .setType(ApplicationCommandType.Message)
  }

  /**
   * Show the save roll modal
   * @return {Promise} Modal promise
   */
  async execute() {
    const message = this.interaction.targetMessage
    if (message.author.id != process.env.CLIENT_ID) {
      return this.interaction.whisper(this.t("validation.foreign"))
    }

    const cachedInvocation = await interactionCache.getMessage(message)
    if (!cachedInvocation) {
      return this.interaction.whisper(this.t("validation.missing"))
    }

    const command = commands.get(cachedInvocation.commandName)
    if (!command.savable) {
      const presented = presentCommand(command, this.locale)
      return this.interaction.whisper(this.t("validation.unsavable", { presented }))
    }

    let validated_options
    try {
      validated_options = await command.schema.validateAsync(cachedInvocation.options, {
        abortEarly: false,
      })
    } catch (err) {
      return this.interaction.whisper(
        this.t("validation.options", {
          command,
          messages: err.details.map((d) => d.message).join("\n"),
        }),
      )
    }

    const cache_data = {
      command: command.name,
      options: validated_options,
    }
    const modal = SavedRollModal.data("create", this.locale, {
      description: validated_options.description,
      saved: cache_data,
      changeable: command.changeable,
    })
    delete validated_options.description

    await rollCache.set(interaction, cache_data)

    return interaction.showModal(modal)
  }

  static help_data(opts) {
    const savable_commands = sortedCommands(opts.locale).savable
    return {
      savable: listCommands(savable_commands, opts.locale),
    }
  }
}

registerCommand(SaveThisRoll)
