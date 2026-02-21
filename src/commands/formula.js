import Joi from "joi"

import { roll } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/formula-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { modifierSchema, rollsSchema, descriptionSchema } from "../util/common-schemas.js"
import { operator } from "../util/formatters/signed.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the formula command
 */
export class Formula extends SavableCommand {
  static name = "formula"
  static changeable = ["modifier"]

  description = ""
  rolls = 1
  formula = ""
  modifier = 0

  static data() {
    return this.builder
      .addLocalizedStringOption("formula", (option) =>
        option.setMinLength(3).setMaxLength(1500).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    formula: Joi.string().required().trim().min(3).max(1500),
    modifier: modifierSchema,
    rolls: rollsSchema,
    description: descriptionSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("formula")
    this.saveOption("description")
    this.saveOption("modifier")
    this.saveOption("rolls")
  }

  perform() {
    /**
     * @type string[]
     */
    const results = []
    /**
     * @type string[]
     */
    const labels = []

    for (const roll_idx in Array.from({ length: this.rolls }, (i) => i)) {
      /**
       * @type string[]
       */
      const raw_pools = []
      /**
       * @type number[]
       */
      const raw_results = []
      /**
       * @type number[]
       */
      const summed_results = []

      let rolled_formula = this.formula.replace(
        /(\d+)[dD](\d+)(?:"(.*?)")?/g,
        (_match, pool, sides, label) => {
          raw_pools.push(`${pool}d${sides}`)
          let raw = roll(pool, sides)
          raw_results.push(raw[0])
          let summed = sum(raw)
          summed_results.push(summed)
          if (roll_idx == 0) labels.push(label)
          return summed
        },
      )
      rolled_formula += operator(this.modifier)
      results.push({
        rolledFormula: rolled_formula,
        pools: raw_pools,
        raw: raw_results,
        summed: summed_results,
        labels,
      })
    }

    return present({
      rolls: this.rolls,
      formula: this.formula,
      description: this.description,
      results,
      locale: this.locale,
    })
  }
}

registerCommand(Formula)
