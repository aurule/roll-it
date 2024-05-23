const {
  SlashCommandBuilder,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/coin-results-presenter")
const commonOpts = require("../util/common-options")

module.exports = {
  name: "coin",
  description: "Flip a coin",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const raw_results = roll(1, 2, 1)

    return interaction.reply({
      content: present({
        description: roll_description,
        raw: raw_results,
        userFlake: interaction.user.id,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return `${command_name} flips a single coin and displays the result as heads or tails.`
  },
}
