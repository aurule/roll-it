const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const saved_roll_completers = require("../../completers/saved-roll-completers")
const { UserSavedRolls, saved_roll_schema } = require("../../db/saved_rolls")
const saved_roll_presenter = require("../../presenters/saved-roll-presenter")
const { i18n } = require("../../locales")
const rollCache = require("../../services/roll-cache")
const SavedRollModal = require("../../modals/saved-roll")

const command_name = "manage"
const parent_name = "saved"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name).addLocalizedStringOption(
      "name",
      (option) => option.setRequired(true).setAutocomplete(true),
    ),
  async execute(cmd_interaction) {
    const saved_rolls = new UserSavedRolls(cmd_interaction.guildId, cmd_interaction.user.id)

    const t = i18n.getFixedT(cmd_interaction.locale, "commands", "saved.manage")

    const roll_name = cmd_interaction.options.getString("name")
    const roll_id = parseInt(roll_name)

    const detail = saved_rolls.detail(roll_id, roll_name)

    if (detail === undefined) {
      return cmd_interaction.whisper(t("options.name.validation.missing"))
    }

    let manage_text = saved_roll_presenter.present(detail, cmd_interaction.locale)
    manage_text += "\n\n"
    manage_text += t("state.initial.prompt")

    const edit_button = new ButtonBuilder()
      .setCustomId("edit")
      .setLabel(t("state.initial.buttons.edit"))
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(t("state.initial.buttons.cancel"))
      .setStyle(ButtonStyle.Secondary)
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel(t("state.initial.buttons.remove"))
      .setStyle(ButtonStyle.Danger)
    const manage_actions = new ActionRowBuilder().addComponents(
      edit_button,
      cancel_button,
      remove_button,
    )
    const manage_prompt = await cmd_interaction.reply({
      content: manage_text,
      components: [manage_actions],
      flags: MessageFlags.Ephemeral,
    })

    const manageHandler = async (comp_interaction) => {
      switch (comp_interaction.customId) {
        case "edit":
          await rollCache.set(cmd_interaction, detail)
          const modal = SavedRollModal.data("edit", cmd_interaction.locale, {
            name: detail.name,
            description: detail.description,
          })
          await comp_interaction.showModal(modal)
          return comp_interaction.editReply({
            content: t("state.edit.response"),
            components: [],
          })
        case "remove":
          const remove_cancel = new ButtonBuilder()
            .setCustomId("remove_cancel")
            .setLabel(t("state.remove.buttons.cancel"))
            .setStyle(ButtonStyle.Secondary)
          const remove_confirm = new ButtonBuilder()
            .setCustomId("remove_confirm")
            .setLabel(t("state.remove.buttons.confirm"))
            .setStyle(ButtonStyle.Danger)
          const remove_actions = new ActionRowBuilder().addComponents(remove_cancel, remove_confirm)
          const remove_chicken = await manage_prompt.edit({
            content: t("state.remove.prompt", { name: detail.name }),
            components: [remove_actions],
            flags: MessageFlags.Ephemeral,
          })

          remove_chicken
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              time: 60_000,
            })
            .then((remove_interaction) => {
              remove_interaction.deferUpdate()
              if (remove_interaction.customId == "remove_cancel") {
                manage_prompt.edit({
                  content: t("state.remove.response.cancel"),
                  components: [],
                  flags: MessageFlags.Ephemeral,
                })
                return cmd_interaction
              }

              saved_rolls.destroy(detail.id)

              return manage_prompt.edit({
                content: t("state.remove.response.success", { name: detail.name }),
                components: [],
                flags: MessageFlags.Ephemeral,
              })
            })
            .catch(() => {
              manage_prompt.delete()
              return cmd_interaction
            })
          break
        case "cancel":
        default:
          manage_prompt.delete()
          return cmd_interaction
      }
    }

    const collector = manage_prompt.createMessageComponentCollector({
      time: 60_000,
    })
    collector.once("collect", manageHandler)
    collector.once("end", (_, reason) => {
      if (reason === "time") {
        return cmd_interaction.editReply({
          content: t("response.timeout"),
          components: [],
        })
      }
    })
  },
  async autocomplete(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "name":
        return saved_roll_completers.saved_roll(partialText, saved_rolls.all())
    }
  },
}
