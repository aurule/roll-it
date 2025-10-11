const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/swn-roller")
const { present } = require("../presenters/results/swn-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { pickDice } = require("../services/pick")
const { pickedSum } = require("../services/tally")
const sacrifice = require("../services/easter-eggs/sacrifice")

const command_name = "swn"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("pool", (option) => option.setMinValue(2))
      .addIntegerOption(commonOpts.rolls)
      .addLocalizedBooleanOption("reroll-1s")
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier", "pool"],
  schema: Joi.object({
    pool: commonSchemas.pool.min(2),
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
  }),
  judge(results, locale) {
    const buckets = [0, 0, 0, 0, 0]
    for (const result of results) {
      switch (true) {
        case result >= 11:
          buckets[0]++
          break
        case result >= 9:
          buckets[1]++
          break
        default:
        case result >= 6:
          buckets[2]++
          break
        case result >= 4:
          buckets[3]++
          break
        case result >= 2:
          buckets[4]++
          break
      }
    }

    const dominating = buckets.findIndex((b) => b >= results.length / 2)
    switch (dominating) {
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
  perform({ pool = 2, rolls = 1, modifier = 0, reroll = false, description, locale = "en-US" } = {}) {
    const raw_results = roll(pool, rolls, reroll)
    const pick_results = pickDice(raw_results, 2, "highest")
    const summed_results = pickedSum(raw_results, pick_results)

    const presented_result = present({
      pool,
      rolls,
      reroll,
      modifier,
      description,
      raw: raw_results,
      picked: pick_results,
      summed: summed_results,
      locale,
    })

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(summed_results, locale)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const pool = interaction.options.getInteger("pool") ?? 2
    const reroll = interaction.options.getBoolean("reroll-1s") ?? false
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      pool,
      rolls,
      modifier,
      reroll,
      description: roll_description,
      locale: interaction.locale,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
}
