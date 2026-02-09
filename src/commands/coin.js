import Joi from "joi"

import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { Command } from "./abstract/command.js"
import { descriptionOption, secretOption} from "../util/common-options.js"
import { descriptionSchema } from "../util/common-schemas.js"
import { present } from "../presenters/results/coin-results-presenter.js"
import { roll } from "../services/base-roller.js"
import { registerCommand } from "./index.js"

/**
 * Class for the /coin command
 */
export class Coin extends Command {
  static name = "coin"
  static schema = Joi.object({
    description: descriptionSchema,
    call: Joi.string().optional().valid("1", "2").messages({
      "any.only": 'Call must be either "1" or "2".',
    }),
  })

  /**
   * The coin face called by the user
   *
   * One of "heads" or "tails", translated appropriately.
   *
   * @type string
   */
  call = ""

  /**
   * Description for the coin toss
   * @type string
   */
  description = ""

  /**
   * Raw dice results
   * @type number[][]
   */
  raw_results

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedStringOption("call", (option) => option.setLocalizedChoices("1", "2"))
      .addBooleanOption(secretOption)
  }

  /**
   * Create a new Coin object
   * @param  {Interaction} interaction Discord interaction object
   * @return {Command}                 New Command object
   */
  constructor(interaction) {
    super(interaction)

    this.saveOption("description")
    this.saveOption("call")
  }

  perform() {
    this.raw_results = roll(1, 2, 1)

    const presented_result = present({
      call: this.call,
      description: this.description,
      raw: this.raw_results,
      locale: this.locale,
    })

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge()
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  }

  /**
   * Pass judgement on the coin toss, as per `sacrifice` easter egg
   * @return {string} Empty for no judgement, otherwise a sacrifice message
   */
  judge() {
    if (this.call === "") return ""

    const result = this.raw_results[0][0]
    if (this.call == result) return sacrifice.good(this.locale)
    return sacrifice.bad(this.locale)
  }
}

registerCommand(Coin)
