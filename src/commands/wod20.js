import Joi from "joi"

import { rollUntil } from "../services/until-roller.js"
import { roll } from "../services/base-roller.js"
import { wod20 } from "../services/tally.js"
import { present } from "../presenters/results/wod20-results-presenter.js"
import { descriptionOption, rollsOption, teamworkOption, secretOption } from "../util/common-options.js"
import { poolSchema, rollsSchema, untilSchema, descriptionSchema } from "../util/common-schemas.js"
import * as hummingbird from "../services/easter-eggs/hummingbird.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { TeamworkableCommand } from "./abstract/teamworkable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the wod20 command
 */
export class Wod20 extends TeamworkableCommand {
  static name = "wod20"
  static savable = true
  static changeable = ["pool", "difficulty"]

  pool = 1
  description = ""
  difficulty = 6
  specialty = false
  rolls = 1
  until = 0

  static data() {
    return this.builder
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("difficulty", (option) => option.setMinValue(2).setMaxValue(10))
      .addLocalizedBooleanOption("specialty")
      .addIntegerOption(rollsOption)
      .addBooleanOption(teamworkOption)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    pool: poolSchema,
    difficulty: Joi.number().optional().integer().min(2).max(10),
    specialty: Joi.boolean().optional(),
    rolls: rollsSchema,
    until: untilSchema,
    description: descriptionSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("pool")
    this.saveOption("description")
    this.saveOption("difficulty")
    this.saveOption("specialty")
    this.saveOption("rolls")
    this.saveOption("until")
  }

  judge(results) {
    const factor = 10 / (11 - this.difficulty)
    const expected = Math.round(this.pool / factor)

    const buckets = [0, 0, 0, 0, 0]
    for (const result of results) {
      switch (true) {
        case result >= expected * 2:
          buckets[0]++
          break
        case result > expected:
          buckets[1]++
          break
        default:
        case result == expected:
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

  performTeamwork(final_pool) {
    const raw_results = roll(final_pool, 10, 1)
    const summed_results = wod20(raw_results, this.difficulty, this.specialty)
    const result_lines = [
      present({
        rolls: 1,
        pool: final_pool,
        difficulty: this.difficulty,
        specialty: this.specialty,
        until: 0,
        description: this.description,
        raw: raw_results,
        summed: summed_results,
        locale: this.locale,
      }),
    ]

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(summed_results)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    return result_lines.join("\n")
  }

  perform() {
    let raw_results
    let summed_results

    if (this.until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(this.pool, 10),
        tally: (currentResult) => wod20(currentResult, this.difficulty, this.specialty),
        max: this.rolls === 1 ? 0 : this.rolls,
        target: this.until,
      }))
    } else {
      raw_results = roll(this.pool, 10, this.rolls)
      summed_results = wod20(raw_results, this.difficulty, this.specialty)
    }

    const result_lines = [
      present({
        rolls: this.rolls,
        pool: this.pool,
        difficulty: this.difficulty,
        specialty: this.specialty,
        until: this.until,
        description: this.description,
        raw: raw_results,
        summed: summed_results,
        locale: this.locale,
      }),
    ]

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(summed_results)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    if (hummingbird.hasTrigger(this.description, this.locale)) {
      if (summed_results.some(hummingbird.qualified)) {
        const hummingbird_message = hummingbird.spotted(this.locale)
        result_lines.push(`-# ${hummingbird_message}`)
      }
    }

    return result_lines.join("\n")
  }

  validate() {
    if (this.teamwork && (this.rolls > 1 || this.until > 0 || this.secret)) {
      return this.t("options.teamwork.validation.conflict")
    }
  }
}

registerCommand(Wod20)
