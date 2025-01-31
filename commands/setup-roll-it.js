const {
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  ButtonBuilder,
  subtext,
  time,
  TimestampStyles,
  MessageFlags,
} = require("discord.js")
const { oneLine } = require("common-tags")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const CommandSelectTransformer = require("../transformers/command-select-transformer")
const SystemSelectTransformer = require("../transformers/system-select-transformer")
const api = require("../services/api")
const { arrayEq } = require("../util/array-eq")
const { systems } = require("../data")
const { pluralize, capitalize, inlineList } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const timeout_ms = 120_000 // 2 minute timeout

const command_name = "setup-roll-it"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  global: true,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  },
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    const t = i18n.getFixedT(interaction.locale, "commands", "setup-roll-it")

    const commands = require("./index")
    const deployable_commands = commands.deployable

    const deployed_command_names = await api
      .getGuildCommands(interaction.guildId)
      .then((res) => res.map((c) => c.name))

    const deployed_set = new Set(deployed_command_names)
    const deployed_system_names = systems
      .filter((system) => {
        const system_set = new Set(system.commands.required)
        return deployed_set.isSupersetOf(system_set)
      })
      .map((s) => s.name)

    const system_picker = new StringSelectMenuBuilder()
      .setCustomId("system_picker")
      .setPlaceholder(t("pickers.system"))
      .setMinValues(0)
      .setMaxValues(systems.size)
      .addOptions(...SystemSelectTransformer.transform(systems, interaction.locale, deployed_system_names))
    const system_row = new ActionRowBuilder().addComponents(system_picker)

    const command_picker = new StringSelectMenuBuilder()
      .setCustomId("command_picker")
      .setPlaceholder(t("pickers.command"))
      .setMinValues(0)
      .setMaxValues(deployable_commands.size)
      .addOptions(
        ...CommandSelectTransformer.transform(deployable_commands, interaction.locale, deployed_command_names),
      )
    const command_row = new ActionRowBuilder().addComponents(command_picker)

    const go_button = new ButtonBuilder()
      .setCustomId("go_button")
      .setLabel(t("buttons.submit"))
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel_button")
      .setLabel(t("buttons.cancel"))
      .setStyle(ButtonStyle.Secondary)
    const buttons_row = new ActionRowBuilder().addComponents(go_button, cancel_button)

    const expiry = new Date(Date.now() + timeout_ms)
    const prompt = await interaction.editReply({
      content: t("prompt", { timeout: time(expiry, TimestampStyles.RelativeTime) }),
      components: [system_row, command_row, buttons_row],
    })

    let selection = deployed_set

    const collector = prompt.createMessageComponentCollector({
      time: timeout_ms,
    })
    collector.on("collect", (event) => {
      switch (event.customId) {
        case "cancel_button":
          collector.stop()
          return event.update({
            content: t("response.cancelled"),
            components: [],
          })
        case "go_button":
          collector.stop()
          if (!selection.size) {
            return event.update({
              content: t("response.empty"),
              components: [],
            })
          }

          const selected_commands = Array.from(selection)
          if (arrayEq(selected_commands, deployed_command_names)) {
            return event.update({
              content: t("response.match"),
              components: [],
            })
          }

          event.deferUpdate()
          return api.setGuildCommands(interaction.guildId, selected_commands).then(() => {
            const presented_commands = selected_commands.map(command_name => {
              const command = commands.get(command_name)
              return CommandNamePresenter.present(command, interaction.locale)
            })
            interaction.editReply({
              content: t("response.success", { commands: presented_commands }),
              components: [],
            })
          })
        case "command_picker":
          event.deferUpdate()
          selection = new Set(event.values)
          // update both select menus in the prompt
          // system select should show systems that now match the selected commands
          // command picker should have all commands
          // commands, systems, selected_commands
          break
        case "system_picker":
          event.deferUpdate()
          // selection = new Set() from required and recommended of all systems from event.values
          // update both select menus in the prompt
          break
      }
    })
    collector.on("end", (_, reason) => {
      if (reason === "time") {
        return interaction.editReply({
          content: t("response.timeout"),
          components: [],
        })
      }
    })
  },
  help_data(opts) {
    const commands = require("./index")
    return {
      deployables: CommandNamePresenter.list(commands.guild, opts.locale),
      globals: CommandNamePresenter.list(commands.global, opts.locale),
    }
  },
}
