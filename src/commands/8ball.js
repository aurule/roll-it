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


// const command_name = "8ball"

// module.exports = {
//   name: command_name,
//   data: () =>
//     new LocalizedSlashCommandBuilder(command_name)
//       .addLocalizedStringOption("question", (option) => option.setRequired(true))
//       .addLocalizedBooleanOption("doit")
//       .addBooleanOption(secretOption),
//   schema: Joi.object({
//     question: Joi.string()
//       .trim()
//       .required()
//       .max(1500)
//       .message("The question is too long. Keep it under 1500 characters."),
//     doit: Joi.boolean().optional(),
//   }),
//   perform({ question, doit, locale = "en-US" }) {
//     const raw_results = roll(1, 20, 1)

//     return present({
//       question,
//       doit,
//       raw: raw_results,
//       locale,
//     })
//   },
//   async execute(interaction) {
//     const question = interaction.options.getString("question")
//     const doit = interaction.options.getBoolean("doit") ?? false
//     const secret = interaction.options.getBoolean("secret") ?? false

//     const partial_message = module.exports.perform({ question, doit, locale: interaction.locale })
//     const full_text = injectMention(partial_message, interaction.user.id)
//     return interaction.rollReply(full_text, secret)
//   },
// }
