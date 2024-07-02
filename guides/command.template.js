const { SlashCommandBuilder } = require("discord.js")

const commonOpts = require("../util/common-options")

module.exports = {
  name: "NAME",
  description: "DESCRIPTION",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description),
  async execute(interaction) {
    return interaction.reply("I AM A TEMPLATE")
  },
  help({ command_name }) {
    return `${command_name} IS A TEMPLATE.`
  },
}
