const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const commonSchemas = require("../util/common-schemas")
const commonOptions = require("../util/common-options")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const sacrifice = require("../services/easter-eggs/sacrifice")
const { roll } = require("../services/base-roller")
const { rollUntil } = require("../services/until-roller")
const { riskSuccesses } = require("../services/tally")
const { ShadowrunAnarchyPresenter } = require("../presenters/results/shadowrun-anarchy-results-presenter")

const command_name = "sra"

/**
 * Convert the `with` keyword into a success threshold
 * @param  {string} keyword Keyword. One of "advantage", "disadvantage", or anything else.
 * @return {number}         4 for "advantage", 6 for "disadvantage", and 5 for other.
 */
function make_threshold(keyword) {
  switch(keyword) {
    case "advantage":
      return 4
    case "disadvantage":
      return 6
    default:
      return 5
  }
}

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(commonOptions.description)
      .addLocalizedIntegerOption("risk")
      .addLocalizedStringOption("with", (option) =>
        option.setLocalizedChoices("advantage", "disadvantage"),
      )
      .addIntegerOption(commonOptions.rolls)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
      .addBooleanOption(commonOptions.secret),
  savable: true,
  changeable: ["pool", "risk"],
  schema: Joi.object({
    pool: commonSchemas.pool,
    risk: Joi.number().optional().integer().min(1).max(1000),
    with: Joi.string().optional().valid("advantage", "disadvantage"),
    rolls: commonSchemas.rolls,
    until: commonSchemas.until,
    description: commonSchemas.description,
  }),
  judge(presenter) {
    // probabilities change based on `threshold` and `risk`
    // 5: pool / 3
    // 4: pool / 2
    // 6: pool / 6
    // risk:
    //   new expected is normal + (normal * risk/pool)
    //   glitch level reduces sacrifice message

    // pool
    // threshold
    // risk
    // successes
    // glitch_count
  },
  make_threshold,
  perform({ pool, risk, advantage, rolls = 1, until, description, locale = "en-US" } = {}) {
    let raw_results
    let summed_results

    const threshold = make_threshold(advantage)

    if (until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(pool, 6),
        tally: (currentResult) => riskSuccesses(currentResult, threshold, risk),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = roll(pool, 6, rolls)
      summed_results = riskSuccesses(raw_results, threshold, risk)
    }

    const presenter = new ShadowrunAnarchyPresenter({
      pool,
      threshold,
      risk,
      rolls,
      until,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })

    const result_lines = [presenter.presentResults()]

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(presenter)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    return result_lines.join("\n")
  },
  async execute(interaction) {
    const pool = interaction.options.getInteger("pool")
    const risk = interaction.options.getInteger("risk") ?? 0
    const advantage = interaction.options.getString("with") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "sra")
    const userFlake = interaction.user.id
   
    if (risk > pool) {
      return interaction.ensure("whisper", t("options.risk.validation.collision"), {
        detail: "Could not whisper about invalid risk"
      })
    }

    const partial_message = module.exports.perform({
      pool,
      risk,
      advantage,
      rolls,
      until,
      description,
    })
    const full_text = injectMention(partial_message, userFlake)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  }
}
