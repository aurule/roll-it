const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  italic,
  underscore,
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

    const prompt = await interaction.reply({content: "Choose the roll commands you want to make available:", components: [picker_row], ephemeral: true})

    const collector = prompt.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 60_000 })

    collector.on('collect', async event => {
      const selection = event.values
      const guildFlake = interaction.guild.id
      await commandService.deployGuild(guildFlake, selection)
      await interaction.editReply({
        content: oneLine`
          Updated server commands to: ${selection}
        `,
        components: [],
        ephemeral: true})
    })
    collector.on('end', async (collected, reason) => {
      await interaction.editReply({content: "Selection timed out. Leaving server commands unchanged.", components: [], ephemeral: true})
    })
  },
  help({ command_name }) {
    const commands = commandFetch.guild()
    return [
      oneLine`
        ${command_name} AAAAAAAAAAA
        Only available to server managers.
      `,
      "",
      "Here are the available roll commands:",
      commands
        .filter(c => c.type !== "menu")
        .map(c => `• ${commandNamePresenter.present(c)} - ${c.description}`)
        .join("\n"),
    ].join("\n")
  },
}
