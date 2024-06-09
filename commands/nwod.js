const {
  SlashCommandBuilder,
  inlineCode,
  italic,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { rollUntil } = require("../services/until-roller")
const { roll } = require("../services/nwod-roller")
const { successes } = require("../services/tally")
const { present } = require("../presenters/nwod-results-presenter")
const { handleTeamwork } = require("../services/teamwork")
const commonOpts = require("../util/common-options")

module.exports = {
  name: "nwod",
  description: "Roll a pool of d10s using rules for New World of Darkness",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("pool")
          .setDescription("The number of dice to roll")
          .setMinValue(0)
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
      .addBooleanOption(option =>
        option
          .setName("rote")
          .setDescription("Re-roll any dice in your initial pool that do not score successes")
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption((option) =>
        option
          .setName("teamwork")
          .setDescription(
            "Begin a teamwork roll where others can contribute dice"
          )
      )
      .addIntegerOption((option) =>
        option
          .setName("until")
          .setDescription(
            "Roll the entire dice pool multiple times until this many successes are accrued"
          )
          .setMinValue(1)
      )
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    let pool = interaction.options.getInteger("pool")
    let explode = interaction.options.getInteger("explode") ?? 10
    let threshold = interaction.options.getInteger("threshold") ?? 8
    const rote = interaction.options.getBoolean("rote") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const is_teamwork = interaction.options.getBoolean("teamwork") ?? false

    const chance = !pool
    if (chance) {
      if (until) {
        return interaction.reply({
          content: `You cannot use the ${inlineCode("until")} option with a chance die.`,
          ephemeral: true,
        })
      }

      pool = 1
      explode = 10
      threshold = 10
    }

    const userFlake = interaction.user.id

    if (is_teamwork) {
      if (rolls > 1 || until > 0 || secret || rote) {
        return interaction.reply({
          content: oneLine`
            You cannot use teamwork with the ${inlineCode("rolls")}, ${inlineCode("rote")},
            ${inlineCode("until")}, or ${inlineCode("secret")} options.
          `,
          ephemeral: true,
        })
      }

      return handleTeamwork({
        interaction,
        userFlake,
        description: roll_description,
        initialPool: pool,
        roller: (final_pool) => roll({
          pool: final_pool,
          explode,
          rolls
        }),
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
        roll: () => roll({pool, explode, rote, threshold, chance}),
        tally: (currentResult) => successes(currentResult, threshold),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = roll({pool, explode, rote, threshold, chance, rolls})
      summed_results = successes(raw_results, threshold)
    }

    return interaction.reply({
      content: present({
        rolls,
        pool,
        rote,
        chance,
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
      "There are also some special mechanics that are supported, even though they don't come up very often:",
      oneLine`
        * When ${inlineCode("rote")} is true, every die in your ${italic("initial")} pool that fails to score
        a success adds another die to the roll
      `,
      oneLine`
        * When your ${inlineCode("pool")} is zero, you get a single "chance" die. If it's a 1, you
        automatically get a "Dramatic Failure". If it's a 10, you get a single success which explodes as
        usual. Any other result is a normal failure. This interacts with ${inlineCode("rote")} in a weird way;
        see ${italic("World of Darkness")} p.135 for details.
      `,
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
        The ${inlineCode("teamwork")} option starts a special teamwork roll that lets other people add dice to
        your pool by responding to a prompt. This is not compatible with the ${inlineCode("rolls")},
        ${inlineCode("rote")}, ${inlineCode("until")}, or ${inlineCode("secret")} options.
      `
    ].join("\n")
  },
}
