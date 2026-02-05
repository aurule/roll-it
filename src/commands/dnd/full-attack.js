import Joi from "joi"

import { DndAttack } from "../../util/rolls/dnd-attack.js"
import { presentFullAttack } from "../../presenters/results/dnd-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../../util/common-options.js"
import { modifierSchema, descriptionSchema, rollsSchema } from "../../util/common-schemas.js"
import { SavableCommand } from "../abstract/savable-command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the dnd full-attack subcommand
 */
class BaseFullAttack extends SavableCommand {
  static name = "full-attack"
  static changeable = ["modifier", "ac", "swings", "crit"]

  swings = 1
  modifier = 0
  description = ""
  crit = 20
  ac = 0
  rolls = 1

  static data() {
    return this.builder
      .addLocalizedIntegerOption("swings", (option) => option.setRequired(true).setMinValue(1))
      .addLocalizedIntegerOption("modifier", (option) => option.setRequired(true))
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("crit", (option) => option.setMinValue(0).setMaxValue(20))
      .addLocalizedIntegerOption("ac", (option) => option.setMinValue(1))
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    swings: Joi.number().required().integer().min(1).messages({
      "number.integer": "Swings must be a whole number.",
      "number.min": "Swings must be 1 or more.",
    }),
    modifier: modifierSchema,
    description: descriptionSchema,
    crit: Joi.number().optional().integer().min(0).max(20).messages({
      "number.integer": "Crit must be a whole number.",
      "number.min": "crit must be between 0 and 20.",
      "number.max": "crit must be between 0 and 20.",
    }),
    ac: Joi.number().optional().integer().min(1).messages({
      "number.integer": "AC must be a whole number.",
      "number.min": "AC must be 1 or more.",
    }),
    rolls: rollsSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("swings")
    this.saveOption("modifier")
    this.saveOption("description")
    this.saveOption("crit")
    this.saveOption("ac")
    this.saveOption("rolls")
  }

  perform() {
    const attacks = Array.from({ length: this.rolls }, () => {
      return Array.from({ length: this.swings }, (_v, idx) => new DndAttack(this.modifier - 5 * idx, this.crit))
    })

    const presented_results = presentFullAttack({
      swings: this.swings,
      attacks,
      modifier: this.modifier,
      crit: this.crit,
      ac: this.ac,
      rolls: this.rolls,
      description: this.description,
      locale: this.locale,
    })

    // this space reserved for easter eggs

    return presented_results
  }
}

/**
 * Class for the dnd full-attack subcommand
 */
export const FullAttack = Child(BaseFullAttack, "dnd")
