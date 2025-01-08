const {
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  italic,
  orderedList,
} = require("discord.js")
const { oneLine } = require("common-tags")
const Completers = require("../../completers/table-completers")
const { GuildRollables } = require("../../db/rollable")
const { i18n } = require("../../locales")

module.exports = {
  name: "manage",
  parent: "table",
  description: "Explain or remove a table",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("table")
          .setDescription("Name of the table to manage")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const t = i18n.getFixedT(interaction.locale, "commands", "table.manage")

    const table_name = interaction.options.getString("table")
    const table_id = parseInt(table_name)

    const detail = tables.detail(table_id, table_name)

    if (detail === undefined) {
      return interaction.whisper(t("options.name.validation.missing"))
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
      content: [
        t("state.initial.details", { table: detail }),
        t("state.initial.prompt"),
      ].join("\n"),
      components: [manage_actions],
      ephemeral: true,
    })

    const manageHandler = async (event) => {
      switch (event.customId) {
        case "show":
          manage_prompt.delete()
          const full_text = t("state.show.response.success", { name: detail.name, contents: orderedList(detail.contents) })

          return interaction.paginate({
            content: full_text,
            split_on: "\n",
            ephemeral: true,
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
            ephemeral: true,
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
                  ephemeral: true,
                })
                return interaction
              }

              tables.destroy(detail.id)

              return manage_prompt.edit({
                content: t("state.remove.response.success", { name: detail.name }),
                components: [],
                ephemeral: true,
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
