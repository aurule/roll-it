const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  ButtonBuilder,
  subtext,
  inlineCode,
  time,
  TimestampStyles
} = require("discord.js")
const { oneLine } = require("common-tags")

const commandNamePresenter = require("../presenters/command-name-presenter")
const CommandSelectTransformer = require("../transformers/command-select-transformer")
const SystemSelectTransformer = require("../transformers/system-select-transformer")
const api = require("../services/api")
const { arrayEq } = require("../util/array-eq")
const { systems } = require("../data")

const timeout_ms = 120_000 // 2 minute timeout

module.exports = {
  name: "setup-roll-it",
  description: "Set up Roll It with the commands you need",
  // global: true,
  global: false,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  },
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const commands = require("./index")
    const deployable_commands = commands.deployable
    const deprecated_commands = commands.deprecated

    const deployed_command_names = await api
      .getGuildCommands(interaction.guildId)
      .then((res) => res.map((c) => c.name))

    const deployed_set = new Set(deployed_command_names)
    const deployed_system_names = systems.filter((system) => {
      const system_set = new Set(system.commands.required)
      return deployed_set.isSupersetOf(system_set)
    }).map(s => s.name)

    // prompt for commands as well as for systems

    // handling for systems
    // make a picker
    // select systems based on whether the deployed commands include the system's required commands
    // selector for non-system commands

    // add deprecation warning

    // handle the prompt collector
    // on select, set based on selected systems' required and recommended commands, plus fun things
    // on go, set commands

    // prompt to select systems
    // set required and recommended commands
    // offer to set optional commands, too
    // only remove commands from the deploy list if they were removed due to user deselection of systems

    const system_picker = new StringSelectMenuBuilder()
      .setCustomId("system_picker")
      .setPlaceholder("Choose game systems")
      .setMinValues(0)
      .setMaxValues(systems.size)
      .addOptions(...SystemSelectTransformer.withCommands(systems, deployed_system_names))
    const system_row = new ActionRowBuilder().addComponents(system_picker)

    const command_picker = new StringSelectMenuBuilder()
      .setCustomId("command_picker")
      .setPlaceholder("Choose individual commands")
      .setMinValues(0)
      .setMaxValues(deployable_commands.size)
      .addOptions(...CommandSelectTransformer.transform(deployable_commands, deployed_command_names))
    const command_row = new ActionRowBuilder().addComponents(command_picker)

    const go_button = new ButtonBuilder()
      .setCustomId("go_button")
      .setLabel("Set Commands")
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel_button")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
    const buttons_row = new ActionRowBuilder().addComponents(go_button, cancel_button)

    const expiry = new Date(Date.now() + timeout_ms)
    let prompt_content = oneLine`
      Choose a game system to add all of its listed commands to the server. Use the second picker to add or
      remove individual commands. If you don't update the commands ${time(expiry, TimestampStyles.RelativeTime)},
      they will be left unchanged.
    `
    if (deprecated_commands.hasAny(deployed_command_names)) {
      const replaced = deprecated_commands.filter((c) => deployed_command_names.includes(c.name))

      const replaced_names = replaced.map(c => present_command(c))
      const replacement_names = replaced.map(c => present_command(commands.get(c.replacement)))
      const num_replaced = replaced.length
      const pronoun = pluralize("it", num_replaced)
      const cap_pronoun = capitalize(pronoun)
      const verb_is = pluralize("is", num_replaced)
      const verb_does = pluralize("does", num_replaced)

      prompt_content += "\n" + subtext(oneline`
        This server uses the deprecated ${pluralize("command", num_replaced)} ${inline(replaced_names)}.
        ${cap_pronoun} ${verb_is} being replaced by ${inline(replacement_names)}, which is why ${pronoun}
        ${verb_does} not appear on this list. ${cap_pronoun} will be removed automatically in the future. If
        you update the server's commands, ${pronoun} will be removed immediately.
      `)
    }
    const prompt = await interaction.editReply({
      content: prompt_content,
      components: [system_row, command_row, buttons_row],
    })

    let selection = deployedSet

    const collector = prompt.createMessageComponentCollector({
      time: timeout_ms,
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
          if (!selection.size) {
            event.update({
              content:
                "You need to pick at least one command. Choose the systems or commands you want to make available on this server:",
            })
            break
          }
          collector.stop()

          const selected_commands = Array.from(selection)
          if (arrayEq(selected_commands, deployed_command_names)) {
            return event.update({
              content: "Commands match. Leaving server commands unchanged.",
              components: [],
            })
          }

          event.deferUpdate()
          return api.setGuildCommands(interaction.guildId, selected_commands).then(() => {
            event.editReply({
              content: oneLine`
                  Updated server commands to: ${selected_commands.join(", ")}
                `,
              components: [],
            })
          })
        case "command_picker":
          event.deferUpdate()
          selection = new Set(event.values)
          // update both select menus in the prompt
          break
        case "system_picker":
          event.deferUpdate()
          // set selection somehow
          // update both select menus in the prompt
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
    const deployable_commands = require("./index").deployable
    return [
      oneLine`
        Since Roll It has so many rollers, it can be helpful to only make specific ones available on your
        server. ${command_name} lets you change which ones can be used. Use it when you first add Roll It,
        and any time you want to add or remove commands.
      `,
      "",
      `${command_name} can only be used by server managers.`,
      "",
      "These are the commands which you can add or remove:",
      deployable_commands
        .filter((c) => c.type !== "menu")
        .map((c) => `• ${commandNamePresenter.present(c)} - ${c.description}`)
        .join("\n"),
    ].join("\n")
  },
}
