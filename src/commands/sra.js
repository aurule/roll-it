import Joi from "joi"

import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { poolSchema, rollsSchema, untilSchema, descriptionSchema } from "../util/common-schemas.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { roll } from "../services/base-roller.js"
import { rollUntil } from "../services/until-roller.js"
import { riskSuccesses } from "../services/tally.js"
import {
  ShadowrunAnarchyPresenter,
} from "../presenters/results/shadowrun-anarchy-results-presenter.js"
import { SavableCommand } from "./abstract/savable-command.js"

/**
 * Convert the `with` keyword into a success threshold
 * @param  {string} keyword Keyword. One of "advantage", "disadvantage", or anything else.
 * @return {number}         4 for "advantage", 6 for "disadvantage", and 5 for other.
 */
export function make_threshold(keyword) {
  switch (keyword) {
    case "advantage":
      return 4
    case "disadvantage":
      return 6
    default:
      return 5
  }
}

/**
 * Class for the sra command
 */
export class Sra extends SavableCommand {
  static name = "sra"
  static changeable = ["pool", "risk"]

  pool = 1

  risk = 0

  threshold = 5

  rolls = 1

  until = 0

  description = ""

  static data() {
    return this.builder
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("risk")
      .addLocalizedStringOption("with", (option) =>
        option.setLocalizedChoices("advantage", "disadvantage"),
      )
      .addIntegerOption(rollsOption)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    pool: poolSchema,
    risk: Joi.number().optional().integer().min(1).max(1000),
    with: Joi.string().optional().valid("advantage", "disadvantage"),
    rolls: rollsSchema,
    until: untilSchema,
    description: descriptionSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("pool")
    this.saveOption("description")
    this.saveOption("risk")
    this.saveOption("rolls")
    this.saveOption("until")
    this.saveOption("secret")

    this.threshold = make_threshold(this.options.get("with"))
  }

  /**
   * Judge the average result for the sacrifice easter egg
   * @param  {ShadowrunAnarchyPresenter} presenter Presenter object
   * @return {string}                              Sacrifice string
   */
  judge(presenter) {
    const buckets = [0, 0, 0, 0, 0]
    let divisor = 3

    switch (presenter.threshold) {
      case 4:
        divisor = 2
        break
      case 6:
        divisor = 6
        break
    }
    let expected = Math.round(presenter.pool / divisor)

    if (presenter.risk) {
      expected = expected + expected * Math.round(presenter.risk / presenter.pool)
    }

    for (const [rollNum, result] of presenter.summed.entries()) {
      let bucket_idx
      switch (true) {
        case result >= expected * 2:
          bucket_idx = 0
          break
        case result > expected:
          bucket_idx = 1
          break
        default:
        case result === expected:
          bucket_idx = 2
          break
        case result >= expected / 2:
          bucket_idx = 3
          break
        case result < expected / 2:
          bucket_idx = 4
          break
      }
      const glitch = presenter.glitches[rollNum]
      const final = Math.min(bucket_idx + glitch, 4)
      buckets[final] += 1
    }

    const dominating = buckets.findIndex((b) => b >= presenter.summed.length / 2)
    switch (dominating) {
      case 0:
        return sacrifice.great(presenter.locale)
      case 1:
        return sacrifice.good(presenter.locale)
      case 2:
      default:
        return sacrifice.neutral(presenter.locale)
      case 3:
        return sacrifice.bad(presenter.locale)
      case 4:
        return sacrifice.awful(presenter.locale)
    }
  }

  perform() {
    let raw_results
    let summed_results

    if (this.until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(this.pool, 6),
        tally: (currentResult) => riskSuccesses(currentResult, this.threshold, this.risk),
        max: this.rolls === 1 ? 0 : this.rolls,
        target: this.until,
      }))
    } else {
      raw_results = roll(this.pool, 6, this.rolls)
      summed_results = riskSuccesses(raw_results, this.threshold, this.risk)
    }

    const presenter = new ShadowrunAnarchyPresenter({
      pool: this.pool,
      threshold: this.threshold,
      risk: this.risk,
      rolls: this.rolls,
      until: this.until,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
      locale: this.locale,
    })

    const result_lines = [presenter.presentResults()]

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = this.judge(presenter)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    return result_lines.join("\n")
  }

  validate() {
    if (this.risk > this.pool) return this.t("options.risk.validation.collision")
  }
}
