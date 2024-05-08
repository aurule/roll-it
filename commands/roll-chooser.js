const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonStyle,
  ButtonBuilder,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const commandFetch = require("../services/command-fetch")
const commandNamePresenter = require("../presenters/command-name-presenter")
const CommandSelectTransformer = require("../transformers/command-select-transformer")
const commandService = require("../services/command-deploy");

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
    const commands = commandFetch.guild()
    const picker = new StringSelectMenuBuilder()
      .setCustomId('chooser')
      .setPlaceholder('Pick one or more')
      .setMinValues(1)
      .setMaxValues(commands.length)
      .addOptions(...CommandSelectTransformer.transform(commands))
    const picker_row = new ActionRowBuilder()
      .addComponents(picker)

    const go_button = new ButtonBuilder()
      .setCustomId('go_button')
      .setLabel("Set Commands")
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId('cancel_button')
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
    const buttons_row = new ActionRowBuilder()
      .addComponents(go_button, cancel_button)

    const prompt = await interaction.reply({
      content: "Choose the Roll It commands you want to make available on this server:",
      components: [picker_row, buttons_row],
      ephemeral: true
    })

    var selection = []

    const collector = prompt.createMessageComponentCollector({
      ComponentType: ComponentType.Button,
      time: 60_000,
    })
    collector.on('collect', event => {
      event.deferUpdate()
      switch(event.customId) {
        case "cancel_button":
          interaction.editReply({
            content: "Cancelled. Leaving server commands unchanged.",
            components: []
          })
          break;
        case "go_button":
          if (!selection.length) {
            interaction.editReply({
              content: "You need to pick at least one command. Choose the Roll It commands you want to make available on this server:"
            })
            break;
          }
          commandService.deployGuild(interaction.guild.id, selection)
            .then(result => {
              interaction.editReply({
                content: oneLine`
                  Updated server commands to: ${selection.join(", ")}
                `,
                components: [],
              })
            })
          break;
        case "chooser":
          selection = event.values
          break;
      }
    })
  },
  help({ command_name }) {
    const commands = commandFetch.guild()
    return [
      oneLine`
        ${command_name} sets which roll commands are available on the server.
        Since Roll It supports so many specific systems, it can be nice to remove the unneeded commands.
      `,
      "",
      `${command_name} can only be used by server managers.`,
      "",
      "These are the commands which you can add or remove:",
      commands
        .filter(c => c.type !== "menu")
        .map(c => `• ${commandNamePresenter.present(c)} - ${c.description}`)
        .join("\n"),
    ].join("\n")
  },
}
