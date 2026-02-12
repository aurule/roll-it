import { Collection } from "discord.js"
import Joi from "joi"

import { present } from "../presenters/results/drh-results-presenter.js"
import { descriptionOption, poolOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, rollsSchema, modifierSchema } from "../util/common-schemas.js"
import { DrhPool } from "../util/rolls/drh-pool.js"
import { SavableCommand } from "./abstract/savable-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the drh roller
 */
export class Drh extends SavableCommand {
  static name = "drh"
  static changeable = ["modifier", "exhaustion", "madness", "discipline", "pain"]

  discipline = 3
  pain = 1
  exhaustion = 0
  madness = 0
  talent = "none"
  modifier = 0
  rolls = 1
  roll_description = ""

  static data() {
    return this.builder
      .addLocalizedIntegerOption("discipline", (option) =>
        option.setRequired(true).setMinValue(1).setMaxValue(6),
      )
      .addLocalizedIntegerOption("pain", (option) =>
        option.setRequired(true).setMinValue(0).setMaxValue(100),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("exhaustion", (option) => option.setMinValue(1).setMaxValue(6))
      .addLocalizedIntegerOption("madness", (option) => option.setMinValue(1))
      .addLocalizedStringOption("talent", (option) =>
        option.setLocalizedChoices("minor", "major", "madness"),
      )
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    discipline: Joi.number().required().integer().min(1).max(6),
    pain: Joi.number().required().integer().min(1).max(100),
    exhaustion: Joi.number()
      .optional()
      .integer()
      .min(1)
      .max(6)
      .when("talent", {
        is: Joi.string().valid("minor", "major"),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    madness: Joi.number()
      .integer()
      .min(1)
      .max(8)
      .when("talent", {
        is: Joi.string().valid("madness"),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    talent: Joi.string().optional().valid("minor", "major", "madness").default("none").messages({
      "any.only": "Talent must be one of 'minor', 'major', or 'madness'.",
    }),
    description: descriptionSchema,
    rolls: rollsSchema,
    modifier: modifierSchema,
  })

  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("discipline")
    this.saveOption("pain")
    this.saveOption("description")
    this.saveOption("exhaustion")
    this.saveOption("madness")
    this.saveOption("talent")
    this.saveOption("modifier")
    this.saveOption("rolls")
  }

  perform() {
    const pool_options = new Collection([["discipline", this.discipline]])
    if (this.pain !== 0) {
      pool_options.set("pain", this.pain)
      pool_options.set("exhaustion", this.exhaustion)
      pool_options.set("madness", this.madness)
    }

    const tests = Array.from({ length: this.rolls }, () => {
      return pool_options.mapValues(DrhPool.fromPool).filter((pool) => pool !== undefined)
    })

    return present({
      helper: this.pain === 0,
      tests,
      description: this.description,
      talent: this.talent,
      rolls: this.rolls,
      modifier: this.modifier,
      locale: this.locale,
    })
  }

  validate() {
    if (this.pain === 0) {
      if (this.talent !== "none") return this.t("response.helping.validation.talent")
      if (this.exhaustion || this.madness) return this.t("response.helping.validation.pools")
      if (this.modifier) return this.t("response.helping.validation.modifier")
    }

    switch (this.talent) {
      case "minor":
      case "major":
        if (this.exhaustion === 0) {
          return this.t("options.talent.validation.exhaustion")
        }
        break
      case "madness":
        if (this.madness === 0) {
          return this.t("options.talent.validation.madness")
        }
        break
    }
  }
}

registerCommand(Drh)
