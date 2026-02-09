import { subtext } from "discord.js"
import Joi from "joi"

import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, rollsSchema } from "../util/common-schemas.js"
import { Command } from "./abstract/command.js"
import { present } from "../presenters/results/met-static-results-presenter.js"
import { compare, handleRequest } from "../services/met-roller.js"
import { registerCommand } from "./index.js"

/**
 * Class for the chop command
 *
 * This largely duplicates the logic of `/met static`, but is less configurable.
 */
export class Chop extends Command {
  static name = "chop"

  description = ""
  static = false
  bomb = false
  rolls = 1

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedBooleanOption("static")
      .addLocalizedBooleanOption("bomb")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  static schema = Joi.object({
    bomb: Joi.boolean().optional(),
    description: descriptionSchema,
    rolls: rollsSchema,
    static_test: Joi.boolean().optional(),
  })

  constructor(interaction) {
    super(interaction)

    this.saveOption("description")
    this.saveOption("static")
    this.saveOption("bomb")
    this.saveOption("rolls")
  }

  perform() {
    const throw_request = this.bomb ? "rand-bomb" : "rand"
    const vs_request = this.static ? "rand" : "none"

    const thrown_symbols = handleRequest(throw_request, this.rolls)
    const vs_symbols = handleRequest(vs_request, this.rolls)
    const compared = thrown_symbols.map((elem, idx) => compare(elem, vs_symbols[idx]))

    const presented = present({
      vs_request,
      rolls: this.rolls,
      thrown: thrown_symbols,
      vs: vs_symbols,
      compared,
      description: this.description,
      locale: this.locale
    })

    return `${presented}\n${subtext(this.t("response.shortcut"))}`
  }
}

registerCommand(Chop)
