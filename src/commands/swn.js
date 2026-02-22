import Joi from "joi"

import { roll } from "../services/swn-roller.js"
import { present } from "../presenters/results/swn-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { poolSchema, descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import { pickDice } from "../services/pick.js"
import { pickedSum } from "../services/tally.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the swn command
 */
export class Swn extends SavableCommand {
  static name = "swn"
  static changeable = ["modifier", "pool"]

  description = ""
  modifier = 0
  pool = 2
  rolls = 1
  reroll = false

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("pool", (option) => option.setMinValue(2))
      .addIntegerOption(rollsOption)
      .addLocalizedBooleanOption("reroll-1s")
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    pool: poolSchema.min(2),
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("description")
    this.saveOption("modifier")
    this.saveOption("pool")
    this.saveOption("rolls")

    this.reroll = this.options.get("reroll-1s") ?? false
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
    const raw_results = roll(this.pool, this.rolls, this.reroll)
    const pick_results = pickDice(raw_results, 2, "highest")
    const summed_results = pickedSum(raw_results, pick_results)

    const presented_result = present({
      pool: this.pool,
      rolls: this.rolls,
      reroll: this.reroll,
      modifier: this.modifier,
      description: this.description,
      raw: raw_results,
      picked: pick_results,
      summed: summed_results,
      locale: this.locale,
    })

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(summed_results, this.locale)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  }
}

registerCommand(Swn)
