const { SlashCommandSubcommandBuilder } = require("discord.js")

module.exports = {
  name: "systems",
  parent: "setup",
  description: "Set available commands based on the game systems you use",
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
  },
  help() {
    return [
      "undefined",
    ].join("\n")
  },
}
