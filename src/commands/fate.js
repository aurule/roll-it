import Joi from "joi"

import { roll } from "../services/base-roller.js"
import { present } from "../presenters/results/fate-results-presenter.js"
import { fudge } from "../services/tally.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { rollsSchema, modifierSchema, descriptionSchema } from "../util/common-schemas.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the fate roller
 */
export class Fate extends SavableCommand {
  static name = "fate"
  static changeable = ["modifier"]

  modifier = 0

  description = ""

  rolls = 1

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    rolls: rollsSchema,
    modifier: modifierSchema,
    description: descriptionSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("description")
    this.saveOption("modifier")
    this.saveOption("rolls")
  }

  /**
   * Judge average outcome for the sacrifice easter egg
   * @param  {number[]} results Summed results
   * @return {string}           Sacrifice string
   */
  judge(results) {
    const buckets = [0, 0, 0, 0, 0]
    for (const result of results) {
      switch (true) {
        case result == 4:
          buckets[0]++
          break
        case result >= 2:
          buckets[1]++
          break
        default:
        case result >= -1:
          buckets[2]++
          break
        case result >= -3:
          buckets[3]++
          break
        case result == -4:
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
    const raw_results = roll(4, 3, this.rolls)
    const summed_results = fudge(raw_results)

    const presented_result = present({
      rolls: this.rolls,
      modifier: this.modifier,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
    })

    if (sacrifice.hasTrigger(description, this.locale)) {
      const sacrifice_message = this.judge(summed_results)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  }
}

registerCommand(Fate)
