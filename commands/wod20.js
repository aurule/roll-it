const { SlashCommandBuilder, italic, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { rollUntil } = require("../services/until-roller")
const { roll } = require("../services/base-roller")
const { wod20 } = require("../services/tally")
const { present } = require("../presenters/wod20-results-presenter")
const { handleTeamwork } = require("../services/teamwork-manager")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { longReply } = require("../util/long-reply")
const { injectMention } = require("../util/inject-user")

module.exports = {
  name: "wod20",
  description: "Roll a pool of d10s using rules for World of Darkness 20th Anniversary",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addIntegerOption((option) =>
        option
          .setName("pool")
          .setDescription("The number of dice to roll")
          .setMinValue(1)
          .setMaxValue(1000)
          .setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("difficulty")
          .setDescription(
            "The number a die has to meet or exceed to count as a success (default 6)",
          )
          .setMinValue(2)
          .setMaxValue(10),
      )
      .addBooleanOption((option) =>
        option.setName("specialty").setDescription("Whether to count 10s as two successes"),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption((option) =>
        option
          .setName("teamwork")
          .setDescription("Begin a teamwork roll where others can contribute dice"),
      )
      .addIntegerOption((option) =>
        option
          .setName("until")
          .setDescription(
            "Roll the entire dice pool multiple times until this many successes are accrued",
          )
          .setMinValue(1),
      )
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["pool", "difficulty"],
  schema: Joi.object({
    pool: commonSchemas.pool,
    difficulty: Joi.number().optional().integer().min(2).max(10),
    specialty: Joi.boolean().optional(),
    rolls: commonSchemas.rolls,
    until: commonSchemas.until,
    description: commonSchemas.description,
  }),
  perform({ pool, difficulty = 7, specialty, rolls = 1, until, description } = {}) {
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

    return present({
      rolls,
      pool,
      difficulty,
      specialty,
      until,
      description,
      raw: raw_results,
      summed: summed_results,
    })
  },
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
        return interaction.whisper(
          oneLine`
            You cannot use teamwork with the ${inlineCode("rolls")}, ${inlineCode("until")}, or
            ${inlineCode("secret")} options.
          `,
        )
      }

      return handleTeamwork({
        interaction,
        userFlake,
        description: roll_description,
        initialPool: pool,
        roller: (final_pool) => roll(final_pool, 10, rolls),
        summer: (raw_results) => wod20(raw_results, difficulty, specialty),
        presenter: (final_pool, raw_results, summed_results) =>
          present({
            rolls,
            pool: final_pool,
            difficulty,
            specialty,
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
      difficulty,
      specialty,
      until,
      description: roll_description,
    })
    const full_text = injectMention(partial_message, userFlake)

    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  help({ command_name, ...opts }) {
    return [
      `The dice mechanics for ${command_name} break down like this:`,
      `* A die that rolls at or above the ${opts.difficulty} value adds a success`,
      `* A die that rolls a 1 subtracts a success`,
      oneLine`
        * If no dice rolled at or above ${opts.difficulty} and one or more dice rolled a 1, the
        final result is a botch
      `,
      "",
      oneLine`
        The ${opts.specialty} option makes any die that rolls a 10 add ${italic("two")} successes
        instead of one. The ${opts.rolls} option lets you roll the same pool and difficulty multiple
        times, like for NPCs.
      `,
      oneLine`
        The ${opts.until} option tells Roll It to continue rolling the same pool and difficulty until the total
        successes meet or exceed the number supplied. When the ${opts.rolls} option is also present,
        it caps the number of attempted rolls.
      `,
      oneLine`
        The ${opts.teamwork} option starts a special teamwork roll that lets other people add dice to
        your pool by responding to a prompt. This is not compatible with the ${opts.rolls},
        ${opts.until}, or ${opts.secret} options.
      `,
    ].join("\n")
  },
}
