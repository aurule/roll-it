const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require("discord.js")

const { logger } = require("../util/logger")
const rollCache = require("../services/roll-cache")
const { i18n } = require("../locales")
const { UserSavedRolls } = require("../db/saved_rolls")

const VALID_MODES = ["create", "edit", "replace"]

/**
 * Modal for updating the name and description of a saved roll
 *
 * @type {Object}
 */
module.exports = {
  name: "saved-roll",
  data(mode, locale, {name, description} = {}) {
    if (!VALID_MODES.includes(mode)) {
      throw new Error(`Unrecognized mode "${mode}" for saved roll modal`)
    }

    const t = i18n.getFixedT(locale, "modals", `saved.${mode}`)

    const modal = new ModalBuilder()
      .setCustomId(module.exports.name)
      .setTitle(t("title"))

    const name_input = new TextInputBuilder()
      .setCustomId("name")
      .setLabel(t("inputs.name.label"))
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(100)
    name_input.data.value = undefined
    if (name) {
      name_input.setValue(name)
    }
    const name_row = new ActionRowBuilder()
      .addComponents(name_input)

    const desc_input = new TextInputBuilder()
      .setCustomId("description")
      .setLabel(t("inputs.description.label"))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(1500)
    desc_input.data.value = undefined
    if (description) desc_input.setValue(description)
    const desc_row = new ActionRowBuilder()
      .addComponents(desc_input)

    modal.addComponents(name_row, desc_row)

    return modal
  },
  async submit(modal_interaction) {
    const cached_roll = rollCache.find(modal_interaction)

    const t = i18n.getFixedT(modal_interaction.locale, "modals", "saved")

    if (!cached_roll) {
      logger.warn(
        {
          user: modal_interaction.user,
          guild: modal_interaction.guildId,
          inputs: modal_interaction.fields.fields
        },
        "no cached saved roll for user"
      )
      return modal_interaction.whisper(t("validation.missing"))
    }

    const name = modal_interaction.fields.getTextInputValue("name")
    const description = modal_interaction.fields.getTextInputValue("description")

    if (! (name && description)) {
      return modal_interaction.whisper(t("validation.empty"))
    }

    cached_roll.name = name
    cached_roll.description = description

    const user_rolls = new UserSavedRolls(modal_interaction.guildId, modal_interaction.user.id)

    try {
      user_rolls.upsert(cached_roll)

      rollCache.remove(modal_interaction)
      return modal_interaction.whisper(t("response.success", {name} ))
    } catch(err) {
      if (!user_rolls.taken(name)) {
        logger.error({err, cached_roll}, `failed to update saved roll`)
        return modal_interaction.whisper(t("response.error"))
      }

      const overwrite = new ButtonBuilder()
        .setCustomId("overwrite")
        .setLabel(t("response.collision.choices.overwrite"))
        .setStyle(ButtonStyle.Danger)

      const abort = new ButtonBuilder()
        .setCustomId("abort")
        .setLabel(t("response.collision.choices.abort"))
        .setStyle(ButtonStyle.Secondary)

      const retry = new ButtonBuilder()
        .setCustomId("retry")
        .setLabel(t("response.collision.choices.retry"))
        .setStyle(ButtonStyle.Success)

      const buttons = new ActionRowBuilder().addComponents(retry, abort, overwrite)

      const prompt_response = await modal_interaction.reply({
        content: t("response.collision.prompt", { name } ),
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
            rollCache.remove(modal_interaction)
            return button_interaction.update({
              content: t("response.collision.overwritten", {name}),
              components: [],
            })
          case "abort":
            rollCache.remove(modal_interaction)
            return button_interaction.update({
              content: t("response.collision.aborted"),
              components: [],
            })
          case "retry":
            const retry_modal = module.exports.data("replace", modal_interaction.locale, { description: cached_roll.description })
            await button_interaction.showModal(retry_modal)
            return button_interaction.editReply({
              content: t("response.collision.retry"),
              components: [],
            })
        }
      })

      collector.on("end", (_, reason) => {
        if (reason === "time") {
          rollCache.remove(modal_interaction)
          return modal_interaction.editReply({
            content: t("response.collision.timeout"),
            components: [],
          })
        }
      })
    }
  },
}
