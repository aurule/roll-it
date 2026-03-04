import { Modal } from "./modal.js"

import {
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  ActionRowBuilder,
} from "discord.js"

import { logger } from "../util/logging/setup.js"
import rollCache from "../services/roll-cache.js"
import { i18n } from "../locales/index.js"
import { UserSavedRolls } from "../db/saved_rolls.js"
import { presentInvocation } from "../presenters/saved-roll-presenter.js"
import { sendError } from "../services/metrics.js"
import * as build from "../util/modal-builders.js"

const VALID_MODES = ["create", "edit", "replace"]

/**
 * Modal for updating the name and description of a saved roll
 */
export class SavedRollModal extends Modal {
  static name = "saved-roll"
  t

  constructor(modal_interaction) {
    super(modal_interaction, -1)
    this.t = i18n.getFixedT(modal_interaction.locale, "modals", "save-roll")
  }

  /**
   * Create the modal data
   * @param  {string}   mode                The modal's mode. One of "create", or "edit"
   * @param  {string}   locale              Locale for translation
   * @param  {object}   options             Additional options
   * @param  {string}   options.name        Name of the roll
   * @param  {string}   options.description Description of the roll
   * @param  {object}   options.saved       Object containing the command name and options list
   * @param  {string[]} options.changeable  Array of changeable options for the command
   * @return {ModalBuilder}                 Modal builder object
   */
  static data(mode, locale, { name, description, saved = {}, changeable = [] } = {}) {
    if (!VALID_MODES.includes(mode)) {
      throw new Error(`Unrecognized mode "${mode}" for saved roll modal`)
    }

    const t = i18n.getFixedT(locale, "modals", `save-roll.${mode}`)

    const name_input = new TextInputBuilder()
      .setCustomId("name")
      .setPlaceholder(t("inputs.name.placeholder"))
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(100)
    name_input.data.value = undefined
    if (name) {
      name_input.setValue(name)
    }

    const desc_input = new TextInputBuilder()
      .setCustomId("description")
      .setPlaceholder(t("inputs.description.placeholder"))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(1500)
    desc_input.data.value = undefined
    if (description) desc_input.setValue(description)

    const components = [
      build.text(
        t("info", {
          invocation: presentInvocation(saved, locale),
          changeable: changeable.map((c) => `\`${c}\``),
        }),
      ),
      build.label(name_input, t("inputs.name.label")),
      build.label(desc_input, t("inputs.description.label")),
    ]

    return build.modal(SavedRollModal.name, t("title"), components)
  }

  async submit() {
    const cached_roll = await rollCache.get(this.interaction)

    if (!cached_roll) {
      logger.warn(
        {
          user: this.interaction.user,
          guild: this.interaction.guildId,
          inputs: this.interaction.fields.fields,
        },
        "no cached saved roll for user",
      )
      return this.whisper(this.t("validation.missing"))
    }

    const name = this.getTextInputValue("name")
    const description = this.getTextInputValue("description")
    if (!(name && description)) {
      return this.whisper(this.t("validation.empty"))
    }

    cached_roll.name = name
    cached_roll.description = description

    const user_rolls = new UserSavedRolls(this.interaction.guildId, this.interaction.user.id)
    try {
      user_rolls.upsert(cached_roll)

      rollCache.delete(this.interaction)
      return this.whisper(this.t("response.success", { name }))
    } catch (err) {
      if (!user_rolls.taken(name)) {
        sendError(err, { cached_roll })
        logger.error({ err, cached_roll }, `failed to update saved roll`)
        return this.whisper(this.t("response.error"))
      }

      const overwrite = new ButtonBuilder()
        .setCustomId("overwrite")
        .setLabel(this.t("response.collision.choices.overwrite"))
        .setStyle(ButtonStyle.Danger)

      const abort = new ButtonBuilder()
        .setCustomId("abort")
        .setLabel(this.t("response.collision.choices.abort"))
        .setStyle(ButtonStyle.Secondary)

      const retry = new ButtonBuilder()
        .setCustomId("retry")
        .setLabel(this.t("response.collision.choices.retry"))
        .setStyle(ButtonStyle.Success)

      const buttons = new ActionRowBuilder().addComponents(retry, abort, overwrite)

      const prompt_response = await this.interaction.reply({
        content: this.t("response.collision.prompt", { name }),
        components: [buttons],
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      })

      const collector = prompt_response.resource.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120_000,
      })

      collector.on("collect", async (button_interaction) => {
        collector.stop()
        switch (button_interaction.customId) {
          case "overwrite":
            const original = user_rolls.detail(undefined, name)
            user_rolls.destroy(original.id)
            user_rolls.upsert(cached_roll)
            rollCache.delete(this.interaction)
            return button_interaction.update({
              content: this.t("response.collision.overwritten", { name }),
              components: [],
            })
          case "abort":
            rollCache.delete(this.interaction)
            return button_interaction.update({
              content: this.t("response.collision.aborted"),
              components: [],
            })
          case "retry":
            const retry_modal = SavedRollModal.data("replace", this.interaction.locale, {
              description: cached_roll.description,
            })
            await button_interaction.showModal(retry_modal)
            return button_interaction.editReply({
              content: this.t("response.collision.retry"),
              components: [],
            })
        }
      })

      collector.on("end", (_, reason) => {
        if (reason === "time") {
          rollCache.delete(this.interaction)
          return this.interaction.editReply({
            content: this.t("response.collision.timeout"),
            components: [],
          })
        }
      })
    }
  }
}
