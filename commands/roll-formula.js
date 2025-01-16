const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/results/roll-formula-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { operator } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "roll-formula"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedStringOption("formula", (option) =>
        option.setMinLength(3).setMaxLength(1500).setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    formula: Joi.string().required().trim().min(3).max(1500),
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
    description: commonSchemas.description,
  }),
  perform({ formula, rolls = 1, modifier = 0, description, locale = "en-US" } = {}) {
    const results = []
    const labels = []

    for (const roll_idx in Array.from({ length: rolls }, (i) => i)) {
      const raw_pools = []
      const raw_results = []
      const summed_results = []

      let rolled_formula = formula.replace(
        /(\d+)d(\d+)(?:"(.*?)")?/g,
        (match, pool, sides, label) => {
          raw_pools.push(`${pool}d${sides}`)
          let raw = roll(pool, sides)
          raw_results.push(raw[0])
          let summed = sum(raw)
          summed_results.push(summed)
          if (roll_idx == 0) labels.push(label)
          return summed
        },
      )
      rolled_formula += operator(modifier)
      results.push({
        rolledFormula: rolled_formula,
        pools: raw_pools,
        raw: raw_results,
        summed: summed_results,
        labels,
      })
    }

    return present({
      rolls,
      formula,
      description,
      results,
      locale,
    })
  },
  async execute(interaction) {
    const formula = interaction.options.getString("formula")
    const roll_description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      formula,
      rolls,
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
