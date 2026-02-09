import Joi from "joi"

import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { present } from "../presenters/results/roll-results-presenter.js"
import { registerCommand } from "./index.js"

/**
 * Class for the pba roller
 */
export class Pba extends SavableCommand {
  static name = "pba"
  static changeable = ["modifier"]

  description = ""
  modifier = 0
  rolls = 1

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("description")
    this.saveOption("modifier")
    this.saveOption("rolls")
  }

  judge(results) {
    const buckets = [0, 0, 0, 0, 0]
    for (const result of results) {
      switch (true) {
        case result >= 11:
          buckets[0]++
          break
        case result >= 9:
          buckets[1]++
          break
        default:
        case result >= 6:
          buckets[2]++
          break
        case result >= 4:
          buckets[3]++
          break
        case result >= 2:
          buckets[4]++
          break
      }
    }

    const dominating = buckets.findIndex((b) => b >= results.length / 2)
    switch (dominating) {
      case 0:
        return sacrifice.great(this.locale)
      case 1:
        return sacrifice.good(this.locale)
      case 2:
      default:
        return sacrifice.neutral(this.locale)
      case 3:
        return sacrifice.bad(this.locale)
      case 4:
        return sacrifice.awful(this.locale)
    }
  }

  perform() {
    const raw_results = roll(2, 6, this.rolls)
    const summed_results = sum(raw_results)

    const presented_result = present({
      rolls: this.rolls,
      pool: 2,
      sides: 6,
      modifier: this.modifier,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
      locale: this.locale,
    })

    if (sacrifice.hasTrigger(description, this.locale)) {
      const sacrifice_message = this.judge(summed_results)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  }
}

registerCommand(Pba)
