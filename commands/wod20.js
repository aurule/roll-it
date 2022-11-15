const {
  SlashCommandBuilder,
  italic,
  inlineCode,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { rollUntil } = require("../services/until-roller")
const { roll } = require("../services/base-roller")
const { wod20 } = require("../services/tally")
const { present } = require("../presenters/wod20-results-presenter")

module.exports = {
  name: "wod20",
  description:
    "Roll a pool of d10s using rules for World of Darkness 20th Anniversary",
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
          .setName("difficulty")
          .setDescription(
            "The number a die has to meet or exceed to count as a success (default 6)"
          )
          .setMinValue(2)
          .setMaxValue(10)
      )
      .addBooleanOption((option) =>
        option
          .setName("specialty")
          .setDescription("Whether to count 10s as two successes")
      )
      .addIntegerOption((option) =>
        option
          .setName("rolls")
          .setDescription(
            "Roll the entire dice pool this many times (default 1)"
          )
          .setMinValue(1)
      )
      .addIntegerOption((option) =>
        option
          .setName("until")
          .setDescription(
            "Roll the entire dice pool multiple times until this many successes are accrued"
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
    const pool = interaction.options.getInteger("pool")
    const difficulty = interaction.options.getInteger("difficulty") ?? 6
    const specialty = interaction.options.getBoolean("specialty") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    let raw_results
    let summed_results

    if (until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(pool, 10),
        tally: (currentResult) => wod20(currentResult, difficulty, specialty),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = roll(pool, 10, rolls)
      summed_results = wod20(raw_results, difficulty, specialty)
    }

    return interaction.reply({
      content: present({
        rolls,
        pool,
        difficulty,
        specialty,
        until,
        description: roll_description,
        raw: raw_results,
        summed: summed_results,
        userFlake: interaction.user.id,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return [
      `${command_name} rolls a number of d10s using the World of Darkness 20th Anniversary edition rules.`,
      "",
      stripIndent`
        Args:
            \`pool\`: (required) The number of dice to roll
            \`difficulty\`: The number a die has to meet or exceed to count as a success (defaults to 6)
            \`specialty\`: Whether to count 10s as two successes
            \`rolls\`: Number of times to roll this dice pool (defaults to 1)
            \`until\`: Roll the entire dice pool multiple times until this many successes are accrued
            \`description\`: A word or two about the roll
            \`secret\`: Whether to hide the roll results from everyone but you
      `,
      "",
      oneLine`
        ${command_name} rolls a number of d10s using the World of Darkness 20th Anniversary edition rules. The
        dice mechanics break down like this:
      `,
      `* A die that rolls at or above the ${inlineCode("difficulty")} value adds a success`,
      `* A die that rolls a 1 subtracts a success`,
      oneLine`
        * If no dice rolled at or above ${inlineCode("difficulty")} and one or more dice rolled a 1, the
        final result is a botch
      `,
      "",
      oneLine`
        The ${inlineCode("specialty")} option makes any die that rolls a 10 add ${italic("two")} successes
        instead of one. The ${inlineCode("rolls")} option lets you roll the same pool and difficulty multiple
        times, like for NPCs.
      `,
      oneLine`
        The ${inlineCode("until")} option tells Roll It to continue rolling the same pool and difficulty until the total
        successes meet or exceed the number supplied. When the ${inlineCode("rolls")} option is also present,
        it caps the number of attempted rolls.
      `
    ].join("\n")
  },
}
