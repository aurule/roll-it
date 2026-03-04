import Joi from "joi"

import { roll, NwodRollOptions } from "../services/nwod-roller.js"
import { rollUntil } from "../services/until-roller.js"
import { successes } from "../services/tally.js"
import { NwodPresenter } from "../presenters/results/nwod-results-presenter.js"
import {
  descriptionOption,
  rollsOption,
  teamworkOption,
  secretOption,
} from "../util/common-options.js"
import { poolSchema, rollsSchema, untilSchema, descriptionSchema } from "../util/common-schemas.js"
import * as hummingbird from "../services/easter-eggs/hummingbird.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { TeamworkableCommand } from "./abstract/teamworkable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the nwod command
 */
export class Nwod extends TeamworkableCommand {
  static name = "nwod"
  static savable = true
  static changeable = ["pool"]

  pool = 1
  description = ""
  explode = 10
  threshold = 8
  rote = false
  rolls = 1
  until = 0
  decreasing = false

  static data() {
    return this.builder
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(0).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("explode", (option) => option.setMinValue(2).setMaxValue(11))
      .addLocalizedIntegerOption("threshold", (option) => option.setMinValue(2).setMaxValue(10))
      .addLocalizedBooleanOption("rote")
      .addIntegerOption(rollsOption)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1).setMaxValue(100))
      .addLocalizedBooleanOption("decreasing")
      .addBooleanOption(teamworkOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    pool: poolSchema,
    explode: Joi.number().optional().integer().min(2).max(11),
    threshold: Joi.number().optional().integer().min(2).max(10),
    rote: Joi.boolean().optional(),
    rolls: rollsSchema,
    until: untilSchema,
    description: descriptionSchema,
    decreasing: Joi.boolean().optional(),
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("pool")
    this.saveOption("description")
    this.saveOption("explode")
    this.saveOption("threshold")
    this.saveOption("rote")
    this.saveOption("rolls")
    this.saveOption("until")
    this.saveOption("decreasing")
  }

  judge(presenter) {
    const buckets = [0, 0, 0, 0, 0]

    if (presenter.chance) {
      for (const rollNum of presenter.summed.keys()) {
        const result = presenter.summed[rollNum]
        const raw = presenter.raw[0][0]
        switch (true) {
          case result > 0:
            buckets[0]++
            break
          case raw > 1:
            buckets[3]++
            break
          default:
            buckets[4]++
            break
        }
      }
    } else {
      const expected = Math.round(presenter.pool / 3)

      for (const result of presenter.summed) {
        switch (true) {
          case result >= expected * 2:
            buckets[0]++
            break
          case result > expected:
            buckets[1]++
            break
          default:
          case result === expected:
            buckets[2]++
            break
          case result >= expected / 2:
            buckets[3]++
            break
          case result < expected / 2:
            buckets[4]++
            break
        }
      }
    }

    const dominating = buckets.findIndex((b) => b >= presenter.summed.length / 2)
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

  performTeamwork(final_pool) {
    const roll_options = new NwodRollOptions({
      pool: final_pool,
      explode: this.explode,
      rote: this.rote,
      threshold: this.threshold,
      rolls: 1,
    })
    const raw_results = roll(roll_options)
    const summed_results = successes(raw_results, this.threshold)
    const presenter = new NwodPresenter({
      rolls: 1,
      pool: final_pool,
      rote: this.rote,
      chance: false,
      explode: this.explode,
      threshold: this.threshold,
      until: 0,
      decreasing: false,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
      locale: this.locale,
    })
    const result_lines = [presenter.presentResults()]

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(presenter)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    return result_lines.join("\n")
  }

  perform() {
    const chance = !this.pool
    // in chance mode, override a bunch of settings
    if (chance) {
      this.pool = 1
      this.explode = 10
      this.threshold = 10
      this.decreasing = false
    }

    let raw_results
    let summed_results

    if (this.until) {
      const rollOptions = new NwodRollOptions({
        pool: this.pool,
        explode: this.explode,
        threshold: this.threshold,
        chance,
        rote: this.rote,
        decreasing: this.decreasing,
      })
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(rollOptions),
        tally: (currentResult) => successes(currentResult, rollOptions.threshold),
        max: this.rolls === 1 ? 0 : this.rolls,
        target: this.until,
      }))
    } else {
      const options = new NwodRollOptions({
        pool: this.pool,
        explode: this.explode,
        rote: this.rote,
        threshold: this.threshold,
        chance,
        rolls: this.rolls,
        decreasing: this.decreasing,
      })
      raw_results = roll(options)
      summed_results = successes(raw_results, this.threshold)
    }

    const presenter = new NwodPresenter({
      rolls: this.rolls,
      pool: this.pool,
      rote: this.rote,
      chance,
      explode: this.explode,
      threshold: this.threshold,
      until: this.until,
      decreasing: this.decreasing,
      description: this.description,
      raw: raw_results,
      summed: summed_results,
      locale: this.locale,
    })
    const result_lines = [presenter.presentResults()]

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(presenter)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    if (
      hummingbird.hasTrigger(this.description, this.locale) &&
      summed_results.some(hummingbird.qualified)
    ) {
      const hummingbird_message = hummingbird.spotted(this.locale)
      result_lines.push(`-# ${hummingbird_message}`)
    }

    return result_lines.join("\n")
  }

  validate() {
    if (this.teamwork && (this.rolls > 1 || this.until > 0 || this.secret || !this.pool)) {
      return this.t("options.teamwork.validation.conflict")
    }
  }
}

registerCommand(Nwod)
