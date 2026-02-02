import Joi from "joi"

import { present } from "../../presenters/results/roll-results-presenter.js"
import { roll } from "../../services/base-roller.js"
import { sum } from "../../services/tally.js"
import { SavableCommand } from "./savable-command.js"
import { descriptionOption, poolOption, rollsOption, secretOption } from "../../util/common-options.js"
import { descriptionSchema, modifierSchema, poolSchema, rollsSchema } from "../../util/common-schemas.js"

/**
 * Specialized parent class for single die commands: d4, d6, etc.
 */
export class PolyhedralCommand extends SavableCommand {
  /**
   * Number of sides for the die to roll
   * @type number
   */
  static sides

  static changeable = ["modifier"]

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(poolOption)
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    description: descriptionSchema,
    modifier: modifierSchema,
    pool: poolSchema,
    rolls: rollsSchema,
  })

  /**
   * Number to add to the sum of all rolled dice in each roll
   * @type number
   */
  modifier = 0

  /**
   * Number of times to repeat the requested roll
   * @type number
   */
  rolls = 1

  /**
   * Total number of dice to roll
   * @type number
   */
  pool = 1

  /**
   * Description of the roll
   * @type string
   */
  description = ""

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("modifier")
    this.saveOption("rolls")
    this.saveOption("pool")
    this.saveOption("description")
  }

  perform() {
    const raw_results = roll(this.pool, this.constructor.sides, this.rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls: this.rolls,
      pool: this.pool,
      sides: this.constructor.sides,
      modifier: this.modifier,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
      locale: this.locale,
    })
  }
}
