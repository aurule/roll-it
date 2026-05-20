import Joi from "joi"

import { SavableCommand } from "./abstract/savable-command.js";
import { descriptionSchema, rollsSchema } from "../util/common-schemas.js";
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js";
import { registerCommand } from "./index.js";
import { roll } from "../services/base-roller.js";
import { present } from "../presenters/results/blades-results-presenter.js"

/**
 * Class for the /blades command
 */
export class Blades extends SavableCommand {
  static name = "blades"
  static changeable = ["pool"]

  pool = 1
  rolls = 1
  description = ""

  static schema = Joi.object({
    pool: Joi.number().required().integer(),
    rolls: rollsSchema,
    description: descriptionSchema,
  })

  static data() {
    return this.builder
      .addLocalizedIntegerOption("pool")
      .addStringOption(descriptionOption)
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("pool")
    this.saveOption("rolls")
    this.saveOption("description")
  }

  perform() {
    const chance = this.pool <= 0
    const rollable_pool = chance ? 2 : this.pool
    const raw_results = roll(rollable_pool, 6, this.rolls)

    return present({
      rolls: this.rolls,
      chance,
      raw: raw_results,
      pool: this.pool,
      description: this.description,
      locale: this.locale,
    })
  }
}

registerCommand(Blades)
