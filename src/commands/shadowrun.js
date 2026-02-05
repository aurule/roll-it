import Joi from "joi"

import { rollUntil } from "../services/until-roller.js"
import { rollExplode } from "../services/base-roller.js"
import { successes } from "../services/tally.js"
import { ShadowrunPresenter, present } from "../presenters/results/shadowrun-results-presenter.js"
import { descriptionOption, rollsOption, teamworkOption, secretOption } from "../util/common-options.js"
import { poolSchema, rollsSchema, untilSchema, descriptionSchema } from "../util/common-schemas.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { TeamworkableCommand } from "./abstract/teamworkable-command.js"

/**
 * Class for the shadowrun command
 */
export class Shadowrun extends TeamworkableCommand {
  static name = "shadowrun"
  static savable = true
  static changeable = ["pool"]

  pool = 1
  description = ""
  edge = false
  explode = 7
  rolls = 1
  until = 0

  static data() {
    return this.builder
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedBooleanOption("edge")
      .addIntegerOption(rollsOption)
      .addBooleanOption(teamworkOption)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    pool: poolSchema,
    edge: Joi.boolean().optional(),
    rolls: rollsSchema,
    until: untilSchema,
    description: descriptionSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("pool")
    this.saveOption("description")
    this.saveOption("edge")
    this.saveOption("rolls")
    this.saveOption("until")

    if (this.edge) this.explode = 6
  }

  judge(presenter) {
    const buckets = [0, 0, 0, 0, 0]
    const expected = Math.round(presenter.pool / 3)

    for (const rollNum of presenter.summed.keys()) {
      const result = presenter.summed[rollNum]
      switch (true) {
        case presenter.glitch(rollNum) && result === 0:
          buckets[4]++
          break
        case presenter.glitch(rollNum):
          buckets[3]++
          break
        case result >= expected * 2:
          buckets[0]++
          break
        case result > expected:
          buckets[1]++
          break
        default:
        case result >= expected / 2:
          buckets[2]++
          break
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
    const raw_results = rollExplode(final_pool, 6, this.explode, 1)
    const summed_results = successes(raw_results, 5)
    const presenter = new ShadowrunPresenter({
      rolls: 1,
      pool: final_pool,
      edge: this.edge,
      until: 0,
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
    let raw_results
    let summed_results

    if (this.until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => rollExplode(this.pool, 6, this.explode),
        tally: (currentResult) => successes(currentResult, 5),
        max: this.rolls === 1 ? 0 : this.rolls,
        target: this.until,
      }))
    } else {
      raw_results = rollExplode(this.pool, 6, this.explode, this.rolls)
      summed_results = successes(raw_results, 5)
    }

    const presenter = new ShadowrunPresenter({
      rolls: this.rolls,
      pool: this.pool,
      edge: this.edge,
      until: this.until,
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

  validate() {
    if (this.teamwork && (this.rolls > 1 || this.until > 0 || this.secret)) {
      return this.t("options.teamwork.validation.conflict")
    }
  }
}
