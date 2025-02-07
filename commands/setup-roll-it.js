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

const timeout_ms = 120_000 // 2 minute timeout

const command_name = "setup-roll-it"

/**
 * Create message components for the setup prompt
 *
 * @param  {Collection} deployable          Collection of valid command objects
 * @param  {Collection} systems             Collection of system objects
 * @param  {Set<str>}   selected_commands   Array of selected command names
 * @param  {str}        locale              Locale name
 * @return {ActionRowBuilder[]}             Array of mesage component rows
 */
function prompt_components(deployable, systems, selected_commands, locale) {
  const t = i18n.getFixedT(locale, "commands", "setup-roll-it")
  const deployed_systems = systems
    .filter((system) => {
      const system_set = new Set(system.commands.required)
      return selected_commands.isSupersetOf(system_set)
    })
    .map((s) => s.name)

  const system_picker = new StringSelectMenuBuilder()
    .setCustomId("system_picker")
    .setPlaceholder(t("pickers.system"))
    .setMinValues(0)
    .setMaxValues(systems.size)
    .addOptions(...SystemSelectTransformer.transform(systems, locale, deployed_systems))
  const system_row = new ActionRowBuilder().addComponents(system_picker)

  const command_picker = new StringSelectMenuBuilder()
    .setCustomId("command_picker")
    .setPlaceholder(t("pickers.command"))
    .setMinValues(0)
    .setMaxValues(deployable.size)
    .addOptions(
      ...CommandSelectTransformer.transform(deployable, locale, Array.from(selected_commands)),
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

  return [system_row, command_row, buttons_row]
}

module.exports = {
  name: command_name,
  global: true,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  },
  async execute(cmd_interaction) {
    await cmd_interaction.deferReply({ flags: MessageFlags.Ephemeral })
    const locale = cmd_interaction.locale
    const t = i18n.getFixedT(locale, "commands", "setup-roll-it")

    const { deployable } = require("./index")

    const deployed_command_names = await api
      .getGuildCommands(cmd_interaction.guildId)
      .then((res) => res.map((c) => c.name))

    const deployed_set = new Set(deployed_command_names)

    const expiry = new Date(Date.now() + timeout_ms)
    const prompt = await cmd_interaction.editReply({
      content: t("prompt", { timeout: time(expiry, TimestampStyles.RelativeTime) }),
      components: prompt_components(deployable, systems, deployed_set, locale),
    })

    let selection = deployed_set

    const collector = prompt.createMessageComponentCollector({
      time: timeout_ms,
    })
    collector.on("collect", async (comp_interaction) => {
      switch (comp_interaction.customId) {
        case "cancel_button":
          collector.stop()
          return comp_interaction.update({
            content: t("response.cancelled"),
            components: [],
          })
        case "go_button":
          collector.stop()
          if (!selection.size) {
            return comp_interaction.update({
              content: t("response.empty"),
              components: [],
            })
          }

          const selected_commands = Array.from(selection).sort()
          if (arrayEq(selected_commands, deployed_command_names)) {
            return comp_interaction.update({
              content: t("response.match"),
              components: [],
            })
          }

          comp_interaction.deferUpdate()
          return api.setGuildCommands(cmd_interaction.guildId, selected_commands).then(() => {
            return selected_commands.map(command_name => {
              const command = deployable.get(command_name)
              return CommandNamePresenter.present(command, locale)
            })
          })
          .then((presented_commands) => {
            return comp_interaction.editReply({
              content: t("response.success", { commands: presented_commands }),
              components: [],
            })
          })
        case "command_picker":
          selection = new Set(comp_interaction.values)
          await comp_interaction.update({
            components: prompt_components(deployable, systems, selection, locale),
          })
          break
        case "system_picker":
          selection = new Set()
          for (const system_name of comp_interaction.values) {
            const system = systems.get(system_name)
            for (const command_name of system.commands.required) {
              selection.add(command_name)
            }
            if (system.commands.recommended) {
              for (const command_name of system.commands.recommended) {
                selection.add(command_name)
              }
            }
          }
          await comp_interaction.update({
            components: prompt_components(deployable, systems, selection, locale),
          })
          break
      }
    })
    collector.on("end", (_, reason) => {
      if (reason === "time") {
        return cmd_interaction.editReply({
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
