const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/fate-results-presenter")
const { fudge } = require("../services/tally")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const sacrifice = require("../services/easter-eggs/sacrifice")

const command_name = "fate"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    rolls: commonSchemas.rolls,
    modifier: commonSchemas.modifier,
    description: commonSchemas.description,
  }),
  judge(results, locale) {
    const buckets = [0,0,0,0,0]
    for (const result of results) {
      switch(true) {
        case result == 4:
          buckets[0]++
          break
        case result >= 2:
          buckets[1]++
          break
        default:
        case result >= -1:
          buckets[2]++
          break
        case result >= -3:
          buckets[3]++
          break
        case result == -4:
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
  perform({ rolls = 1, modifier = 0, description, locale = "en-US" } = {}) {
    const raw_results = roll(4, 3, rolls)
    const summed_results = fudge(raw_results)

    const presented_result = present({
      rolls,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
    })

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(summed_results, locale);
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
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
