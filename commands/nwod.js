const { SlashCommandBuilder, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll, NwodRollOptions } = require("../services/nwod-roller")
const { rollUntil } = require("../services/until-roller")
const { successes } = require("../services/tally")
const { present } = require("../presenters/results/nwod-results-presenter")
const { handleTeamwork } = require("../services/teamwork-manager")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")

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
          .setMinValue(0)
          .setMaxValue(1000)
          .setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("explode")
          .setDescription(
            "Add another die to the pool for every die that rolls at or above this number (default 10)",
          )
          .setMinValue(2)
          .setMaxValue(11),
      )
      .addIntegerOption((option) =>
        option
          .setName("threshold")
          .setDescription(
            "The number a die has to meet or exceed to count as a success (default 8)",
          )
          .setMinValue(2)
          .setMaxValue(10),
      )
      .addBooleanOption((option) =>
        option
          .setName("rote")
          .setDescription("Re-roll any dice in your initial pool that do not score successes"),
      )
      .addIntegerOption(commonOpts.rolls)
      .addIntegerOption((option) =>
        option
          .setName("until")
          .setDescription(
            "Roll the entire dice pool multiple times until this many successes are accrued",
          )
          .setMinValue(1)
          .setMaxValue(100),
      )
      .addBooleanOption((option) =>
        option
          .setName("decreasing")
          .setDescription("Remove 1 die from the pool for each roll after the first"),
      )
      .addBooleanOption((option) =>
        option
          .setName("teamwork")
          .setDescription("Begin a teamwork roll where others can contribute dice"),
      )
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["pool"],
  schema: Joi.object({
    pool: commonSchemas.pool,
    explode: Joi.number().optional().integer().min(2).max(11),
    threshold: Joi.number().optional().integer().min(2).max(10),
    rote: Joi.boolean().optional(),
    rolls: commonSchemas.rolls,
    until: commonSchemas.until,
    description: commonSchemas.description,
    decreasing: Joi.boolean().optional(),
  }),
  perform({
    pool,
    explode = 10,
    threshold = 8,
    rote,
    rolls = 1,
    until,
    description,
    decreasing,
    locale = "en-US",
  } = {}) {
    const chance = !pool
    if (chance) {
      pool = 1
      explode = 10
      threshold = 10
      decreasing = false
    }

    let raw_results
    let summed_results

    if (until) {
      const rollOptions = new NwodRollOptions({
        pool,
        explode,
        threshold,
        chance,
        rote,
        decreasing,
      })
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(rollOptions),
        tally: (currentResult) => successes(currentResult, rollOptions.threshold),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      const options = new NwodRollOptions({
        pool,
        explode,
        rote,
        threshold,
        chance,
        rolls,
        decreasing,
      })
      raw_results = roll(options)
      summed_results = successes(raw_results, threshold)
    }

    return present({
      rolls,
      pool,
      rote,
      chance,
      explode,
      threshold,
      until,
      decreasing,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })
  },
  execute(interaction) {
    let pool = interaction.options.getInteger("pool")
    let explode = interaction.options.getInteger("explode") ?? 10
    let threshold = interaction.options.getInteger("threshold") ?? 8
    const rote = interaction.options.getBoolean("rote") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const decreasing = interaction.options.getBoolean("decreasing") ?? false
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const is_teamwork = interaction.options.getBoolean("teamwork") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "nwod")

    const userFlake = interaction.user.id

    if (is_teamwork) {
      if (rolls > 1 || until > 0 || secret || !pool) {
        return interaction.whisper(t("options.teamwork.validation.conflict"))
      }

      return handleTeamwork({
        interaction,
        userFlake,
        description: roll_description,
        initialPool: pool,
        roller: (final_pool) => {
          const options = new NwodRollOptions({
            pool: final_pool,
            explode,
            rote,
            threshold,
            rolls,
          })
          return roll(options)
        },
        summer: (raw_results) => successes(raw_results, threshold),
        presenter: (final_pool, raw_results, summed_results) =>
          present({
            rolls,
            pool: final_pool,
            explode,
            threshold,
            rote,
            until,
            description: roll_description,
            raw: raw_results,
            summed: summed_results,
          }),
      })
    }

    const partial_message = module.exports.perform({
      rolls,
      pool,
      rote,
      explode,
      threshold,
      until,
      decreasing,
      description: roll_description,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, userFlake)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      ephemeral: secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      `The dice mechanics for ${command_name} break down like this:`,
      `* A die that rolls at or above the ${opts.threshold} value adds a success`,
      `* A die that rolls at or above the ${opts.explode} value adds another die to the roll`,
      "",
      "There are also some special mechanics that are supported, even though they don't come up very often:",
      oneLine`
        * When ${opts.rote} is true, every die in your ${italic("initial")} pool that fails to score a success
        ds another die to the roll
      `,
      oneLine`
        * When your ${opts.pool} is zero, you get a single "chance" die. This interacts with ${opts.rote} in a
        weird way; see ${italic("World of Darkness")} p.135 for details.
      `,
      "",
      `If you want to roll a pool with no 10-again, set ${opts.explode} to 11.`,
      "",
      `The ${opts.rolls} option lets you roll the same pool and difficulty multiple times, like for NPCs.`,
      "",
      oneLine`
        The ${opts.until} option tells Roll It to continue rolling the same pool and difficulty until the
        total successes meet or exceed the number supplied. When the ${opts.rolls} option is also present, it
        caps the number of attempted rolls.
      `,
      "",
      oneLine`
        When ${opts.decreasing} is true, each roll after the first has its ${opts.pool} lowered by one. So the
        first roll uses the full pool, the second roll has a -1 penalty, the third has -2, etc. This
        implements the book rule of a cumulative penalty on retries. No effect unless ${opts.rolls} is more
        than 1 or ${opts.until} is used.
      `,
      "",
      oneLine`
        The ${opts.teamwork} option starts a special teamwork roll that lets other people add dice to your
        pool by responding to a prompt. This is not compatible with the ${opts.rolls}, ${opts.until}, or
        ${opts.secret} options.
      `,
      "",
      oneLine`
        Although ${command_name} is happy to roll a chance die, you have to have a ${opts.pool} of at least 1
        in order to save the roll.
      `,
    ].join("\n")
  },
}
