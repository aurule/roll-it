const {
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  italic,
} = require("discord.js")
const { oneLine } = require("common-tags")
const Completers = require("../../completers/table-completers")
const { GuildRollables } = require("../../db/rollable")
const { presentContents } = require("../../presenters/table-contents-presenter")
const { splitMessage } = require("../../util/long-reply")

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

    const table_name = interaction.options.getString("table")
    const table_id = parseInt(table_name)

    const detail = tables.detail(table_id, table_name)

    if (detail === undefined) {
      return interaction.whisper(
        "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
      )
    }

    const show_button = new ButtonBuilder()
      .setCustomId("show")
      .setLabel("Show Entries")
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel("Remove Table")
      .setStyle(ButtonStyle.Danger)
    const manage_actions = new ActionRowBuilder().addComponents(
      show_button,
      cancel_button,
      remove_button,
    )
    const manage_prompt = await interaction.reply({
      content: [
        "All about this table:",
        `${italic("Name:")} ${detail.name}`,
        `${italic("Description:")} ${detail.description}`,
        `${italic("Total Entries:")} ${detail.die}`,
        "What do you want to do?",
      ].join("\n"),
      components: [manage_actions],
      ephemeral: true,
    })

    const manageHandler = async (event) => {
      switch (event.customId) {
        case "show":
          manage_prompt.delete()
          const full_text =
            `These are the entries in the ${italic(detail.name)} table:\n` +
            presentContents(detail.contents)

          const split_contents = splitMessage(full_text, "\n")

          for (const msg of split_contents) {
            interaction.followUp({
              content: msg,
              ephemeral: true,
            })
          }

          return interaction
        case "remove":
          const remove_cancel = new ButtonBuilder()
            .setCustomId("remove_cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
          const remove_confirm = new ButtonBuilder()
            .setCustomId("remove_confirm")
            .setLabel("Remove")
            .setStyle(ButtonStyle.Danger)
          const remove_actions = new ActionRowBuilder().addComponents(remove_cancel, remove_confirm)
          const remove_chicken = await manage_prompt.edit({
            content: `Are you sure you want to remove the table ${italic(detail.name)}? This action is permanent.`,
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
                manage_prompt.edit({ content: "Cancelled!", components: [], ephemeral: true })
                return interaction
              }

              tables.destroy(detail.id)

              return manage_prompt.edit({
                content: `The table ${italic(detail.name)} has been removed.`,
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
