import Joi from "joi"

import { roll } from "../services/base-roller.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, rollsSchema } from "../util/common-schemas.js"
import { FfrpgPresenter } from "../presenters/results/ffrpg-results-presenter.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { Command } from "./abstract/command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the ffrpg roller
 */
export class Ffrpg extends Command {
  static name = "ffrpg"

  base = 0
  intrinsic = 0
  conditional = 0
  avoid = 0
  crit = 10
  botch = 95
  flat = false
  rolls = 1
  description = ""

  static data() {
    return this.builder
      .addLocalizedIntegerOption("base", (option) => option.setRequired(true))
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("intrinsic")
      .addLocalizedIntegerOption("conditional")
      .addLocalizedIntegerOption("avoid")
      .addLocalizedIntegerOption("crit", (option) => option.setMinValue(0).setMaxValue(100))
      .addLocalizedIntegerOption("botch", (option) => option.setMinValue(0).setMaxValue(100))
      .addLocalizedBooleanOption("flat")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    base: Joi.number().integer().required(),
    intrinsic: Joi.number().optional().integer(),
    conditional: Joi.number().optional().integer(),
    avoid: Joi.number().optional().integer(),
    crit: Joi.number().optional().integer().min(0).max(100),
    botch: Joi.number().optional().integer().min(0).max(100).greater(Joi.ref("crit")),
    description: descriptionSchema,
    rolls: rollsSchema,
  })

  constructor(interaction) {
    super(interaction)

    this.saveOption("base")
    this.saveOption("intrinsic")
    this.saveOption("conditional")
    this.saveOption("avoid")
    this.saveOption("crit")
    this.saveOption("botch")
    this.saveOption("flat")
    this.saveOption("rolls")
    this.saveOption("description")

    if (this.flat) {
      this.crit = 0
      this.botch = 0
    }
  }

  judge(presenter) {
    const buckets = [0, 0, 0, 0]

    for (let idx = 0; idx < presenter.raw.length; idx++) {
      switch (presenter.rollResult(idx)) {
        case "result.rule10":
        case "result.crit":
          buckets[0]++
          break
        case "result.simple":
          buckets[1]++
          break
        case "result.fail":
          buckets[2]++
          break
        case "result.botch":
          buckets[3]++
          break
      }

      const dominating = buckets.findIndex((b) => b >= presenter.raw.length / 2)
      switch (dominating) {
        case 0:
          return sacrifice.great(this.locale)
        case 1:
          return sacrifice.good(this.locale)
        case 3:
          return sacrifice.bad(this.locale)
        case 4:
          return sacrifice.awful(this.locale)
        default:
          return sacrifice.neutral(this.locale)
      }
    }
  }

  perform() {
    const raw_results = roll(1, 100, this.rolls)

    const presenter = new FfrpgPresenter({
      raw: raw_results,
      base: this.base,
      intrinsic: this.intrinsic,
      conditional: this.conditional,
      avoid: this.avoid,
      crit: this.crit,
      botch: this.botch,
      flat: this.flat,
      rolls: this.rolls,
      description: this.description,
      locale: this.locale,
    })

    const presented_result = presenter.presentResults()

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(presenter, this.locale)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  }

  validate() {
    if (this.flat) {
      if (this.intrinsic + this.conditional + this.avoid) {
        return this.t("validation.flat.disallowed")
      }
      return
    }

    if (this.crit && this.botch && this.crit >= this.botch) {
      return this.t("validation.crit.collision")
    }
  }
}

registerCommand(Ffrpg)
