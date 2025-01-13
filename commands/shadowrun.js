const { inlineCode, unorderedList } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { rollUntil } = require("../services/until-roller")
const { rollExplode } = require("../services/base-roller")
const { successes } = require("../services/tally")
const { present } = require("../presenters/results/shadowrun-results-presenter")
const { handleTeamwork } = require("../services/teamwork-manager")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "shadowrun"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option
          .setMinValue(1)
          .setMaxValue(1000)
          .setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addLocalizedBooleanOption("edge")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.teamwork)
      .addLocalizedIntegerOption("until", (option) =>
        option
          .setMinValue(1),
      )
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["pool"],
  schema: Joi.object({
    pool: commonSchemas.pool,
    edge: Joi.boolean().optional(),
    rolls: commonSchemas.rolls,
    until: commonSchemas.until,
    description: commonSchemas.description,
  }),
  perform({ pool, edge, rolls = 1, until, description, locale = "en-US" } = {}) {
    let raw_results
    let summed_results

    const explode = edge ? 6 : 7

    if (until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => rollExplode(pool, 6, explode),
        tally: (currentResult) => successes(currentResult, 5),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = rollExplode(pool, 6, explode, rolls)
      summed_results = successes(raw_results, 5)
    }

    return present({
      rolls,
      pool,
      edge,
      until,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })
  },
  async execute(interaction) {
    const pool = interaction.options.getInteger("pool")
    const edge = interaction.options.getBoolean("edge") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const is_teamwork = interaction.options.getBoolean("teamwork") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "shadowrun")

    const userFlake = interaction.user.id

    if (is_teamwork) {
      if (rolls > 1 || until > 0 || secret) {
        return interaction.whisper(t("options.teamwork.validation.conflict"))
      }

      const explode = edge ? 6 : 7
      return handleTeamwork({
        interaction,
        userFlake,
        description: roll_description,
        initialPool: pool,
        roller: (final_pool) => rollExplode(final_pool, 6, explode, rolls),
        summer: (raw_results) => successes(raw_results, 5),
        presenter: (final_pool, raw_results, summed_results) =>
          present({
            rolls,
            pool: final_pool,
            edge,
            until,
            description: roll_description,
            raw: raw_results,
            summed: summed_results,
            locale: interaction.locale,
          }),
      })
    }

    const partial_message = module.exports.perform({
      rolls,
      pool,
      edge,
      until,
      description: roll_description,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, userFlake)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      `The dice mechanics for ${command_name} break down like this:`,
      unorderedList([
        "A die that rolls a 5 or 6 adds a success",
        `If ${opts.edge} is true, then a die that rolls a 6 adds another die to the roll`,
        "If more than half the dice roll a 1, your result is a glitch",
        "If more than half the dice roll a 1 and you have no successes, your result is a critical glitch",
      ]),
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
        The ${opts.teamwork} option starts a special teamwork roll that lets other people add dice to your
        pool by responding to a prompt. This is not compatible with the ${opts.rolls}, ${opts.until}, or
        ${opts.secret} options. Only useful for 4e and 6e.
      `,
    ].join("\n")
  },
}
