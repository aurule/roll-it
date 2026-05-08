import Joi from "joi"

import { roll } from "../services/base-roller.js"
import { present } from "../presenters/results/curv-results-presenter.js"
import { keepFromArray, strategies } from "../services/pick.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { modifierSchema, rollsSchema, descriptionSchema } from "../util/common-schemas.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { with_to_keep } from "../util/with-to-keep.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the /curv command
 */
export class Curv extends SavableCommand {
  static name = "curv"
  static changeable = ["modifier"]

  modifier = 0
  keep = "all"
  rolls = 1
  description = ""

  static schema = Joi.object({
    modifier: modifierSchema,
    keep: Joi.string()
      .optional()
      .valid(...strategies)
      .messages({
        "any.only": "Keep must be one of 'all', 'highest', or 'lowest'.",
      }),
    with: Joi.string().optional().valid("advantage", "disadvantage"),
    rolls: rollsSchema,
    description: descriptionSchema,
  }).oxor("keep", "with")

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedStringOption("with", (option) =>
        option.setLocalizedChoices("advantage", "disadvantage"),
      )
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("modifier")
    this.saveOption("rolls")
    this.saveOption("description")
    // Keep is special, because it needs to be translated from "advantage" to "highest"
    this.keep = with_to_keep(this.interaction.options.getString("with"))
  }

  /**
   * Judge a result for the sacrifice easter egg
   * @param  {object[]} picked Array of pick data
   * @return {string}          Sacrifice string
   */
  judge(picked) {
    const buckets = picked
      .reduce(
        (acc, cur) => {
          const bucket = Math.ceil(cur.results[0] / 4) - 1
          acc[bucket]++
          return acc
        },
        [0, 0, 0, 0, 0],
      )
      .reverse()

    const dominating = buckets.findIndex((b) => b >= picked.length / 2)
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
    const advantage_rolls = this.keep == "all" ? 1 : 2
    const raw_results = Array.from({ length: this.rolls }, () => roll(3, 6, advantage_rolls))
    const sums = raw_results.map((roll_set) => {
      return roll_set.map((result) => {
        return result.reduce((acc, curr) => acc + curr, 0)
      })
    })
    const picked_results = sums.map((sum) => keepFromArray(sum, 1, this.keep).indexes[0])

    const presented_result = present({
      rolls: this.rolls,
      picked: picked_results,
      sums,
      modifier: this.modifier,
      description: this.description,
      keep: this.keep,
      raw: raw_results,
      locale: this.locale,
    })

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(picked_results)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  }
}

registerCommand(Curv)
