import Joi from "joi"

import { roll } from "../services/base-roller.js"
import { present } from "../presenters/results/8ball-results-presenter.js"
import { secretOption } from "../util/common-options.js"
import { Command } from "./abstract/command.js"

export class Magic8Ball extends Command {
  static name = "8ball"
  static schema = Joi.object({
    question: Joi.string()
      .trim()
      .required()
      .max(1500)
      .message("The question is too long. Keep it under 1500 characters."),
    doit: Joi.boolean().optional()
  })

  /**
   * The question asked of the 8 ball
   * @type string
   */
  question

  /**
   * Whether to force a positive result
   * @type boolean
   */
  doit

  static data() {
    return this.builder
      .addLocalizedStringOption("question", (option) => option.setRequired(true))
      .addLocalizedBooleanOption("doit")
      .addBooleanOption(secretOption)
  }

  constructor(interaction) {
    super(interaction)

    this.question = this.options.getString("question")
    this.doit = this.options.getBoolean("doit") ?? false
    this.secret = this.options.getBoolean("secret") ?? false
  }

  perform() {
    const raw_results = roll(1, 20, 1)

    return present({
      question: this.question,
      doit: this.doit,
      raw: raw_results,
      locale: this.locale,
    })
  }
}
