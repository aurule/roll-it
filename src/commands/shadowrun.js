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

const command_name = "shadowrun"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addLocalizedBooleanOption("edge")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.teamwork)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
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
}
