const {
  SlashCommandBuilder,
  userMention,
  inlineCode,
  italic,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/coin-results-presenter")

module.exports = {
  name: "coin",
  description: "Flip a coin",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A word or two about this roll")
      )
      .addBooleanOption((option) =>
        option
          .setName("secret")
          .setDescription("Hide the roll results from everyone but you")
      ),
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
    return [
      oneLine`
        ${command_name} flips a coin
      `,
      "",
      stripIndent`
        Args:
            \`description\`: A word or two about the coin flip
            \`secret\`: Whether to hide the coin flip result from everyone but you
      `,
      "",
      oneLine`
        ${command_name} flips a single coin and displays the result as heads or tails.
      `,
    ].join("\n")
  },
}
