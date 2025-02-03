const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll, NwodRollOptions } = require("../services/nwod-roller")
const { rollUntil } = require("../services/until-roller")
const { successes } = require("../services/tally")
const { present } = require("../presenters/results/nwod-results-presenter")
const { handleTeamwork } = require("../services/teamwork-manager")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")

const command_name = "nwod"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(0).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("explode", (option) => option.setMinValue(2).setMaxValue(11))
      .addLocalizedIntegerOption("threshold", (option) => option.setMinValue(2).setMaxValue(10))
      .addLocalizedBooleanOption("rote")
      .addIntegerOption(commonOpts.rolls)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1).setMaxValue(100))
      .addLocalizedBooleanOption("decreasing")
      .addBooleanOption(commonOpts.teamwork)
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
      secret,
    })
  },
}
