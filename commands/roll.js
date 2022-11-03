const { SlashCommandBuilder, userMention, bold, inlineCode } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const {present} = require("../presenters/roll-results-presenter")

module.exports = {
  name: "roll",
  description: "Roll a set of dice",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addIntegerOption((option) =>
        option
          .setName("pool")
          .setDescription("The number of dice to roll")
          .setMinValue(1)
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("sides")
          .setDescription("The number of sides on the dice")
          .setMinValue(2)
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("modifier")
          .setDescription("A number to add to the result after adding up the rolled dice")
      )
      .addIntegerOption((option) =>
        option
          .setName("rolls")
          .setDescription("Roll the entire dice pool this many times (default 1)")
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
    const pool = interaction.options.getInteger("pool")
    const sides = interaction.options.getInteger("sides")
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const raw_results = roll(pool, sides, rolls)
    const summed_results = sum(raw_results)

    return interaction.reply({
      content: present({
        rolls,
        pool,
        sides,
        description: roll_description,
        raw: raw_results,
        summed: summed_results,
        modifier,
        userFlake: interaction.user.id
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return [
      oneLine`
        ${command_name} rolls a pool of dice.
      `,
      "",
      stripIndent`
        Args:
            \`pool\`: (required) The number of dice to roll
            \`sides\`: (required) The number of sides the dice have
            \`modifier\`: A number to add to the result after adding up the rolled dice
            \`rolls\`: Number of times to roll this dice pool (defaults to 1)
            \`description\`: A word or two about the roll
            \`secret\`: Whether to hide the roll results from everyone but you
      `,
      "",
      oneLine`
        ${command_name} is the basic dice rolling command in Roll It. Use ${command_name} to roll one or more
        dice, add them together, and add a modifier to the result. Use the ${inlineCode("rolls")} option to roll
        the same pool (and modifier) multiple times, like for multiple attacks in D&D.
      `,
    ].join("\n")
  },
}
