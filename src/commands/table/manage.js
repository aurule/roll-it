const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const Completers = require("../../completers/table-completers")
const { GuildRollables } = require("../../db/rollable")
const { i18n } = require("../../locales")

const command_name = "manage"
const parent_name = "table"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name).addLocalizedStringOption(
      "table",
      (option) => option.setRequired(true).setAutocomplete(true),
    ),
  async execute(cmd_interaction) {
    const tables = new GuildRollables(cmd_interaction.guildId)

    const t = i18n.getFixedT(cmd_interaction.locale, "commands", "table.manage")

    const table_name = cmd_interaction.options.getString("table")
    const table_id = parseInt(table_name)

    const detail = tables.detail(table_id, table_name)

    if (detail === undefined) {
      return cmd_interaction.whisper(t("options.table.validation.missing"))
    }

    const show_button = new ButtonBuilder()
      .setCustomId("show")
      .setLabel(t("state.initial.buttons.show"))
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
      show_button,
      cancel_button,
      remove_button,
    )
    const manage_prompt = await cmd_interaction.reply({
      content: [t("state.initial.details", { table: detail }), t("state.initial.prompt")].join(
        "\n",
      ),
      components: [manage_actions],
      flags: MessageFlags.Ephemeral,
    })

    const manageHandler = async (comp_interaction) => {
      switch (comp_interaction.customId) {
        case "show":
          await manage_prompt.delete()
          const full_text = t("state.show.response.success", {
            name: detail.name,
            contents: detail.contents,
          })

          return cmd_interaction.paginate({
            content: full_text,
            split_on: "\n",
            secret: true,
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
            .then((remove_event) => {
              remove_event.deferUpdate()
              if (remove_event.customId == "remove_cancel") {
                manage_prompt.edit({
                  content: t("state.remove.response.cancel"),
                  components: [],
                  flags: MessageFlags.Ephemeral,
                })
                return cmd_interaction
              }

              tables.destroy(detail.id)

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
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "table":
        return Completers.table(partialText, tables.all())
    }
  },
}
