import Joi from "joi"

import { roll } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/roll-results-presenter.js"
import { poolOption, descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { poolSchema, descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import { SavableCommand } from "./abstract/savable-command.js"

/**
 * Class for the global roll command
 */
export class Roll extends SavableCommand {
  static name = "roll"
  static global = true
  static changeable = ["modifier", "pool"]

  pool = 1
  sides = 2
  modifier = 0
  rolls = 1
  description = ""

  static data() {
    return this.builder
      .addIntegerOption((opt) => poolOption(opt).setRequired(true))
      .addLocalizedIntegerOption("sides", (option) => option.setMinValue(2).setRequired(true))
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    pool: poolSchema,
    sides: Joi.number().required().integer().min(2).max(100000),
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("pool")
    this.saveOption("sides")
    this.saveOption("modifier")
    this.saveOption("rolls")
    this.saveOption("description")
  }

  perform() {
    const raw_results = roll(this.pool, this.sides, this.rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls: this.rolls,
      pool: this.pool,
      sides: this.sides,
      modifier: this.modifier,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
      locale: this.locale,
    })
  }
}
