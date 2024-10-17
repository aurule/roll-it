const { SlashCommandSubcommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  ButtonBuilder,
  subtext,
  inlineCode,
} = require("discord.js")
const { oneLine } = require("common-tags")

const api = require("../../services/api")
const present_command = require("../../presenters/command-name-presenter").present
const CommandSelectTransformer = require("../../transformers/command-select-transformer")
const { inline } = require("../../util/inline-list")
const { capitalize } = require("../../util/capitalize")
const { arrayEq } = require("../../util/array-eq")

module.exports = {
  name: "commands",
  parent: "setup",
  description: "Set available commands exactly as you like",
  data() {
    return new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
  },
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const commands = require("../index")
    const deployable_commands = commands.deployable
    const deprecated_commands = commands.deprecated

    const deployed_command_names = await api
      .getGuildCommands(interaction.guildId)
      .then((res) => res.map((c) => c.name))

    const picker = new StringSelectMenuBuilder()
      .setCustomId("chooser")
      .setPlaceholder("Pick one or more")
      .setMinValues(1)
      .setMaxValues(deployable_commands.size)
      .addOptions(...CommandSelectTransformer.transform(deployable_commands, deployed_command_names))
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

    let prompt_content = "Choose the Roll It commands you want to make available on this server:"
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
      components: [picker_row, buttons_row],
    })

    let selection = deployed_command_names

    const collector = prompt.createMessageComponentCollector({
      time: 120_000, // 2 minute timeout
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

          if (arrayEq(selection, deployed_command_names)) {
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
    const deployable_commands = require("../index").deployable
    return [
      oneLine`
        Since Roll It has so many rollers, it can be helpful to only make specific ones available on your
        server. ${command_name} directly sets which roll commands are available. To set them based on game
        systems, use ${inlineCode("/setup systems")}.
      `,
      "",
      `${command_name} can only be used by server managers.`,
      "",
      "These are the commands which you can add or remove:",
      deployable_commands
        .filter((c) => c.type !== "menu")
        .map((c) => `• ${present_command(c)} - ${c.description}`)
        .join("\n"),
    ].join("\n")
  },
}
