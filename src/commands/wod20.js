const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { rollUntil } = require("../services/until-roller")
const { roll } = require("../services/base-roller")
const { wod20 } = require("../services/tally")
const { present } = require("../presenters/results/wod20-results-presenter")
const { handleTeamwork } = require("../services/teamwork-manager")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const hummingbird = require("../services/easter-eggs/hummingbird")
const sacrifice = require("../services/easter-eggs/sacrifice")

const command_name = "wod20"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("difficulty", (option) => option.setMinValue(2).setMaxValue(10))
      .addLocalizedBooleanOption("specialty")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.teamwork)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
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
  judge(results, pool, difficulty, locale) {
    const factor = 10 / (11 - difficulty)
    const expected = Math.round(pool / factor)

    const buckets = [0,0,0,0,0]
    for (const result of results) {
      switch(true) {
        case result >= expected * 2:
          buckets[0]++
          break
        case result > expected:
          buckets[1]++
          break
        default:
        case result === expected:
          buckets[2]++
          break
        case result >= expected / 2:
          buckets[3]++
          break
        case result < expected / 2:
          buckets[4]++
          break
      }
    }

    const dominating = buckets.findIndex(b => b >= results.length / 2)
    switch(dominating) {
      case 0:
        return sacrifice.great(locale)
      case 1:
        return sacrifice.good(locale)
      case 2:
      default:
        return sacrifice.neutral(locale)
      case 3:
        return sacrifice.bad(locale)
      case 4:
        return sacrifice.awful(locale)
    }
  },
  perform({
    pool,
    difficulty = 7,
    specialty,
    rolls = 1,
    until,
    description,
    locale = "en-US",
  } = {}) {
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

    const result_lines = [present({
      rolls,
      pool,
      difficulty,
      specialty,
      until,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })]

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(summed_results, pool, difficulty, locale)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    if (hummingbird.hasTrigger(description, locale)) {
      if (summed_results.some(hummingbird.qualified)) {
        const hummingbird_message = hummingbird.spotted(locale)
        result_lines.push(`-# ${hummingbird_message}`)
      }
    }

    return result_lines.join("\n")
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

    const t = i18n.getFixedT(interaction.locale, "commands", "wod20")

    const userFlake = interaction.user.id

    if (is_teamwork) {
      if (rolls > 1 || until > 0 || secret) {
        return interaction.whisper(t("options.teamwork.validation.conflict"))
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
            locale: interaction.locale,
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
