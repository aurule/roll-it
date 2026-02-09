import Joi from "joi"

import { rollExplode } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/kob-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the kob command
 */
export class Kob extends SavableCommand {
  static name = "kob"
  static changeable = ["modifier"]

  sides = 4

  description = ""

  modifier = 0

  rolls = 1

  static data() {
    return this.builder
      .addLocalizedIntegerOption("sides", (option) =>
        option
          .addChoices(
            { name: "4", value: 4 },
            { name: "6", value: 6 },
            { name: "8", value: 8 },
            { name: "10", value: 10 },
            { name: "12", value: 12 },
            { name: "20", value: 20 },
            { name: "100", value: 100 },
          )
          .setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    sides: Joi.number().required().integer().valid(4, 6, 8, 10, 12, 20, 100),
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("sides")
    this.saveOption("description")
    this.saveOption("modifier")
    this.saveOption("rolls")
  }

  perform() {
    const raw_results = rollExplode(1, this.sides, this.sides, this.rolls)

    return present({
      sides: this.sides,
      rolls: this.rolls,
      modifier: this.modifier,
      description: this.description,
      raw: raw_results,
      summed: sum(raw_results),
      locale: this.locale,
    })
  }
}

registerCommand(Kob)
