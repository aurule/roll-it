const { SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js")
const Completers = require("../../completers/table-completers")
const { GuildRollables } = require("../../db/rollable")

module.exports = {
  name: "manage",
  parent: "table",
  description: "Explain, change, or remove a table",
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
      return interaction.reply({
        content:
          "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
        ephemeral: true,
      })
    }

    const edit_button = new ButtonBuilder()
      .setCustomId("edit")
      .setLabel("Edit Info")
      .setStyle(ButtonStyle.Primary)
    const show_button = new ButtonBuilder()
      .setCustomId("show")
      .setLabel("Show Contents")
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle("ButtonStyle.Secondary")
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel("Remove Table")
      .setStyle(ButtonStyle.Danger)
    const manage_actions = new ActionRowBuilder()
      .addComponents(edit_button, show_button, remove_button)
    const manage_prompt = interaction.reply({
      content: `managing table ${detail.name}`,
      components: [manage_actions],
      ephemeral: true,
    })

    const mangeHandler = (event) => {
      manage_prompt.delete()

      switch(event.customId) {
        case "cancel":
          return
        case "edit":
          // show modal with name and description (paragraph) fields
          // update changed fields in the db
          break
        case "show":
          return interaction.followUp({
            content: "", // present table contents, need longReply
            ephemeral: true,
          })
          break
        case "remove":
          // prompt to confirm, then delete the table
          // tables.destroy(table_id)
          break
      }
    }

    return manage_prompt
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 6000,
      })
      .then((event) => {
        event.deferUpdate()
        return manageHandler(event)
      }, manageHandler)
  },
  async autocomplete(interaction) {
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch (focusedOption.name) {
      case "table":
        return Completers.table(partialText, tables.all())
    }
  },
  help({ command_name }) {
    return `${command_name} IS A TEMPLATE.`
  },
}
