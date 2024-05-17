const {
  SlashCommandBuilder,
  inlineCode,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { rollUntil } = require("../services/until-roller")
const { rollExplode } = require("../services/base-roller")
const { successes } = require("../services/tally")
const { present } = require("../presenters/nwod-results-presenter")
const { handleTeamwork } = require("../services/teamwork")

module.exports = {
  name: "nwod",
  description: "Roll a pool of d10s using rules for New World of Darkness",
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
          .setName("explode")
          .setDescription(
            "Add another die to the pool for every die that rolls at or above this number (default 10)"
          )
          .setMinValue(2)
          .setMaxValue(11)
      )
      .addIntegerOption((option) =>
        option
          .setName("threshold")
          .setDescription(
            "The number a die has to meet or exceed to count as a success (default 8)"
          )
          .setMinValue(2)
          .setMaxValue(10)
      )
      .addBooleanOption((option) =>
        option
          .setName("teamwork")
          .setDescription(
            "Begin a teamwork roll where others can contribute dice"
          )
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
    const explode = interaction.options.getInteger("explode") ?? 10
    const threshold = interaction.options.getInteger("threshold") ?? 8
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
        roller: (final_pool) => rollExplode(final_pool, 10, explode, rolls),
        summer: (raw_results) => successes(raw_results, threshold),
        presenter: (final_pool, raw_results, summed_results) => present({
          rolls,
          pool: final_pool,
          explode,
          threshold,
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
        roll: () => rollExplode(pool, 10, explode),
        tally: (currentResult) => successes(currentResult, threshold),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = rollExplode(pool, 10, explode, rolls)
      summed_results = successes(raw_results, threshold)
    }

    return interaction.reply({
      content: present({
        rolls,
        pool,
        explode,
        threshold,
        until,
        description: roll_description,
        raw: raw_results,
        summed: summed_results,
        userFlake,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return [
      `The dice mechanics for ${command_name} break down like this:`,
      `* A die that rolls at or above the ${inlineCode("threshold")} value adds a success`,
      `* A die that rolls at or above the ${inlineCode("explode")} value adds another die to the roll`,
      "",
      `If you want to roll a pool with no 10-again, set ${inlineCode("explode")} to 11.`,
      oneLine`
        The ${inlineCode("rolls")} option lets you roll the same pool and difficulty multiple times, like for
        NPCs.
      `,
      oneLine`
        The ${inlineCode("until")} option tells Roll It to continue rolling the same pool and difficulty until
        the total successes meet or exceed the number supplied. When the ${inlineCode("rolls")} option is also
        present, it caps the number of attempted rolls.
      `,
      oneLine`
        The ${inlineCode("teamwork")} option starts a special teamwork roll that lets other people add dice by
        responding to a prompt. This is not compatible with the ${inlineCode("rolls")}, ${inlineCode("until")},
        or ${inlineCode("secret")} options.
      `
    ].join("\n")
  },
}
