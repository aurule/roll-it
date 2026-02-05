import Joi from "joi"

import { roll } from "../../services/base-roller.js"
import { presentSave } from "../../presenters/results/dnd-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../../util/common-options.js"
import { modifierSchema, descriptionSchema, rollsSchema } from "../../util/common-schemas.js"
import { SavableCommand } from "../abstract/savable-command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the dnd save subcommand
 */
class BaseSave extends SavableCommand {
  static name = "save"
  static parent = "dnd"
  static changeable = ["modifier", "dc"]

  description = ""
  modifier = 0
  dc = 0
  rolls = 1

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("dc", (option) => option.setMinValue(1))
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    modifier: modifierSchema,
    description: descriptionSchema,
    dc: Joi.number().optional().integer().min(1).messages({
      "number.integer": "DC must be a whole number.",
      "number.min": "DC must be 1 or more.",
    }),
    rolls: rollsSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("description")
    this.saveOption("modifier")
    this.saveOption("dc")
    this.saveOption("rolls")
  }

  perform() {
    const raw_results = roll(1, 20, this.rolls)
    const presented_results = presentSave({
      raw: raw_results,
      modifier: this.modifier,
      dc: this.dc,
      rolls: this.rolls,
      description: this.description,
      locale: this.locale,
    })

    // this space reserved for easter eggs

    return presented_results
  }
}

/**
 * Class for the dnd save subcommand
 */
export const Save = Child(BaseSave, "dnd")
