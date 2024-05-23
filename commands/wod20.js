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
const { handleTeamwork } = require("../services/teamwork")
const commonOpts = require("../util/common-options")

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
      .addBooleanOption((option) =>
        option
          .setName("teamwork")
          .setDescription(
            "Begin a teamwork roll where others can contribute dice"
          )
      )
      .addIntegerOption(commonOpts.rolls)
      .addIntegerOption((option) =>
        option
          .setName("until")
          .setDescription(
            "Roll the entire dice pool multiple times until this many successes are accrued"
          )
          .setMinValue(1)
      )
      .addStringOption(commonOpts.description)
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    const pool = interaction.options.getInteger("pool")
    const difficulty = interaction.options.getInteger("difficulty") ?? 6
    const specialty = interaction.options.getBoolean("specialty") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const is_teamwork = interaction.options.getBoolean("teamwork") ?? false

    const userFlake = interaction.user.id

    if (is_teamwork) {
      if (rolls > 1 || until > 0 || secret) {
        return interaction.reply({
          content: oneLine`
            You cannot use teamwork with the ${inlineCode("rolls")}, ${inlineCode("until")}, or
            ${inlineCode("secret")} options.
          `,
          ephemeral: true,
        })
      }

      return handleTeamwork({
        interaction,
        userFlake,
        description: roll_description,
        initialPool: pool,
        roller: (final_pool) => roll(final_pool, 10, rolls),
        summer: (raw_results) => wod20(raw_results, difficulty, specialty),
        presenter: (final_pool, raw_results, summed_results) => present({
          rolls,
          pool: final_pool,
          difficulty,
          specialty,
          until,
          description: roll_description,
          raw: raw_results,
          summed: summed_results,
          userFlake
        })
      })
    }

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
        userFlake
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return [
      `The dice mechanics for ${command_name} break down like this:`,
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
      `,
      oneLine`
        The ${inlineCode("teamwork")} option starts a special teamwork roll that lets other people add dice by
        responding to a prompt. This is not compatible with the ${inlineCode("rolls")}, ${inlineCode("until")},
        or ${inlineCode("secret")} options.
      `
    ].join("\n")
  },
}
