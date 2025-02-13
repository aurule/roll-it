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

    const manage_actions = new ActionRowBuilder()
    if (detail.incomplete) {
      const no_edit_button = new ButtonBuilder()
        .setCustomId("no-edit")
        .setLabel(t("state.initial.buttons.stop"))
        .setStyle(ButtonStyle.Success)
      manage_actions.addComponents(no_edit_button)
    } else {
      const edit_button = new ButtonBuilder()
        .setCustomId("edit")
        .setLabel(t("state.initial.buttons.edit"))
        .setStyle(ButtonStyle.Primary)
      manage_actions.addComponents(edit_button)
    }
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(t("state.initial.buttons.cancel"))
      .setStyle(ButtonStyle.Secondary)
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel(t("state.initial.buttons.remove"))
      .setStyle(ButtonStyle.Danger)
    manage_actions.addComponents(cancel_button, remove_button)
    const manage_prompt = await cmd_interaction.reply({
      content: manage_text,
      components: [manage_actions],
      flags: MessageFlags.Ephemeral,
    })

    const manageHandler = async (comp_interaction) => {
      switch (comp_interaction.customId) {
        case "edit":
          try {
            saved_rolls.update(detail.id, { incomplete: true })
          } catch {
            return manage_prompt.edit({
              content: t("state.edit.response.incomplete", { name: detail.name }),
              components: [],
              flags: MessageFlags.Ephemeral,
            })
          }

          return manage_prompt.edit({
            content: t("state.edit.response.success", { name: detail.name }),
            components: [],
            flags: MessageFlags.Ephemeral,
          })
        case "no-edit":
          const command = require("../index").get(detail.command)
          try {
            await command.schema.validateAsync(detail.options)
            await saved_roll_schema.validateAsync(detail)
          } catch (err) {
            saved_rolls.update(detail.id, { incomplete: false, invalid: true })

            return manage_prompt.edit({
              content: t("state.stop.response.invalid", { name: detail.name }),
              components: [],
              flags: MessageFlags.Ephemeral,
            })
          }

          saved_rolls.update(detail.id, { incomplete: false, invalid: false })

          return manage_prompt.edit({
            content: t("state.stop.response.success"),
            components: [],
            flags: MessageFlags.Ephemeral,
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
            content: t("state.remove.prompt"),
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
