import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { roll } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/formula-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { modifierSchema, rollsSchema, descriptionSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import { operator } from "../util/formatters/signed.js.js"

const command_name = "formula"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedStringOption("formula", (option) =>
        option.setMinLength(3).setMaxLength(1500).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    formula: Joi.string().required().trim().min(3).max(1500),
    modifier: modifierSchema,
    rolls: rollsSchema,
    description: descriptionSchema,
  }),
  perform({ formula, rolls = 1, modifier = 0, description, locale = "en-US" } = {}) {
    const results = []
    const labels = []

    for (const roll_idx in Array.from({ length: rolls }, (i) => i)) {
      const raw_pools = []
      const raw_results = []
      const summed_results = []

      let rolled_formula = formula.replace(
        /(\d+)[dD](\d+)(?:"(.*?)")?/g,
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
      secret,
    })
  },
}
