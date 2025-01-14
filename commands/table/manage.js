const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  italic,
  MessageFlags,
} = require("discord.js")
const { oneLine } = require("common-tags")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const Completers = require("../../completers/table-completers")
const { GuildRollables } = require("../../db/rollable")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

const command_name = "manage"
const parent_name = "table"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name).addLocalizedStringOption(
      "table",
      (option) => option.setRequired(true).setAutocomplete(true),
    ),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const t = i18n.getFixedT(interaction.locale, "commands", "table.manage")

    const table_name = interaction.options.getString("table")
    const table_id = parseInt(table_name)

    const detail = tables.detail(table_id, table_name)

    if (detail === undefined) {
      return interaction.whisper(t("options.table.validation.missing"))
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
    const manage_prompt = await interaction.reply({
      content: [t("state.initial.details", { table: detail }), t("state.initial.prompt")].join(
        "\n",
      ),
      components: [manage_actions],
      flags: MessageFlags.Ephemeral,
    })

    const manageHandler = async (event) => {
      switch (event.customId) {
        case "show":
          manage_prompt.delete()
          const full_text = t("state.show.response.success", {
            name: detail.name,
            contents: detail.contents,
          })

          return interaction.paginate({
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
                return interaction
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
              return interaction
            })
          break
        case "cancel":
        default:
          manage_prompt.delete()
          return interaction
      }
    }

    return manage_prompt
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60_000,
      })
      .then((event) => {
        event.deferUpdate()
        return manageHandler(event)
      }, manageHandler)
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
  help({ command_name }) {
    return [
      `${command_name} lets you see the details about a table, or remove it from this server.`,
      "",
      oneLine`
        Removing a table is permanent. The only way to get it back is to add a new table with the same name
        and entries.
      `,
      "",
      oneLine`
        Due to limitations in Discord, editing a table is not possible right now. In order to change a table's
        name, description, or entries, you have to remove the old table and add a new one with the desired
        changes.
      `,
    ].join("\n")
  },
}
