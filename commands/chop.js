const {
  SlashCommandBuilder,
  inlineCode,
  italic,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/chop-results-presenter")

module.exports = {
  name: "chop",
  description: "Make a rock-paper-scissors roll",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addBooleanOption((option) =>
        option
          .setName("static")
          .setDescription(
            "Display results as pass-tie-fail, for static challenges"
          )
      )
      .addBooleanOption((option) =>
        option
          .setName("bomb")
          .setDescription("Replace paper with the special bomb result")
      )
      .addIntegerOption((option) =>
        option
          .setName("rolls")
          .setDescription(
            "Roll rock-paper-scissors this many times (default 1)"
          )
          .setMinValue(1)
      )
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
    const static_test = interaction.options.getBoolean("static") ?? false
    const bomb = interaction.options.getBoolean("bomb") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const raw_results = roll(1, 3, rolls)

    return interaction.reply({
      content: present({
        rolls,
        static_test,
        bomb,
        description: roll_description,
        raw: raw_results,
        userFlake: interaction.user.id,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return oneLine`
      ${command_name} rolls a single round of rock-paper-scissors. The results are normally displayed using
      emoji and a word describing the outcome, like "\:rock: rock". The ${inlineCode("static")} option
      changes this to display pass, tie, or fail, to make it easier to interpret the result of an uncontested
      challenge. The ${inlineCode("bomb")} option replaces the paper result with bomb, which wins against
      rock and paper. Setting both ${inlineCode("static")} and ${inlineCode("bomb")} will display the result
      as pass, ${italic("pass")}, or fail, as the bomb result wins against the assumed paper result of the
      static opponent.
    `
  },
}
