const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  ButtonBuilder,
} = require("discord.js")
const { oneLine } = require("common-tags")

const commandNamePresenter = require("../presenters/command-name-presenter")
const CommandSelectTransformer = require("../transformers/command-select-transformer")
const api = require("../services/api")
const { arrayEq } = require("../util/array-eq")

module.exports = {
  name: "roll-chooser",
  description: "Choose which commands from Roll It are available on this server",
  global: true,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  },
  async execute(interaction) {
    const commands = require("./index")
    const guild_commands = commands.guild()
    const deployed_commands = await api
      .getGuildCommands(interaction.guildId)
      .then((res) => res.map((c) => c.name))

    const picker = new StringSelectMenuBuilder()
      .setCustomId("chooser")
      .setPlaceholder("Pick one or more")
      .setMinValues(1)
      .setMaxValues(guild_commands.size)
      .addOptions(...CommandSelectTransformer.transform(guild_commands, deployed_commands))
    const picker_row = new ActionRowBuilder().addComponents(picker)

    const go_button = new ButtonBuilder()
      .setCustomId("go_button")
      .setLabel("Set Commands")
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel_button")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
    const buttons_row = new ActionRowBuilder().addComponents(go_button, cancel_button)

    const prompt = await interaction.reply({
      content: "Choose the Roll It commands you want to make available on this server:",
      components: [picker_row, buttons_row],
      ephemeral: true,
    })

    let selection = deployed_commands

    const collector = prompt.createMessageComponentCollector({
      time: 60_000, // 1 minute timeout
    })
    collector.on("collect", (event) => {
      switch (event.customId) {
        case "cancel_button":
          collector.stop()
          return event.update({
            content: "Cancelled. Leaving server commands unchanged.",
            components: [],
          })
        case "go_button":
          if (!selection.length) {
            event.update({
              content:
                "You need to pick at least one command. Choose the Roll It commands you want to make available on this server:",
            })
            break
          }
          collector.stop()

          if (arrayEq(selection, deployed_commands)) {
            return event.update({
              content: "Commands match. Leaving server commands unchanged.",
              components: [],
            })
          }

          event.deferUpdate()
          return api.setGuildCommands(interaction.guildId, selection).then(() => {
            event.editReply({
              content: oneLine`
                  Updated server commands to: ${selection.join(", ")}
                `,
              components: [],
            })
          })
        case "chooser":
          event.deferUpdate()
          selection = event.values
          break
      }
    })
    collector.on("end", (_, reason) => {
      if (reason === "time") {
        return interaction.editReply({
          content: "Ran out of time. Leaving server commands unchanged.",
          components: [],
        })
      }
    })
  },
  help({ command_name }) {
    const guild_commands = require("./index").guild()
    return [
      oneLine`
        ${command_name} sets which roll commands are available on the server.
        Since Roll It supports so many specific systems, it can be nice to remove the unneeded commands.
      `,
      "",
      `${command_name} can only be used by server managers.`,
      "",
      "These are the commands which you can add or remove:",
      guild_commands
        .filter((c) => c.type !== "menu")
        .map((c) => `• ${commandNamePresenter.present(c)} - ${c.description}`)
        .join("\n"),
    ].join("\n")
  },
}
