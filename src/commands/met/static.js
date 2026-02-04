import { compare, handleRequest } from "../../services/met-roller.js"
import { present } from "../../presenters/results/met-static-results-presenter.js"
import * as sacrifice from "../../services/easter-eggs/sacrifice.js"
import * as advice from "../../services/easter-eggs/advice.js"
import { descriptionOption, rollsOption, secretOption } from "../../util/common-options.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Class for the met static command
 */
export const MetStatic = Child(StaticBase, "met")

/**
 * Base class for the met static command
 */
class StaticBase extends Command {
  static name = "static"

  description = ""
  throw = "rand"
  vs = "rand"
  rolls = 1

  static data() {
    return this.builder
      .addStringOption(descriptionOption)
      .addLocalizedStringOption("throw", (option) =>
        option.setLocalizedChoices("rock", "paper", "bomb", "scissors", "rand", "rand-bomb"),
      )
      .addLocalizedStringOption("vs", (option) =>
        option.setLocalizedChoices("rand", "rand-bomb", "none"),
      )
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("description")
    this.saveOption("throw")
    this.saveOption("vs")
    this.saveOption("rolls")
  }

  judge(compared) {
    if (compared.includes("")) return sacrifice.neutral(this.locale)

    const totals = {
      win: 0,
      tie: 0,
      lose: 0,
    }

    for (const result of compared) {
      totals[result]++
    }

    const threshold = compared.length / 2

    if (totals.win > threshold) return sacrifice.great(this.locale)
    if (totals.tie > threshold) return sacrifice.good(this.locale)
    if (totals.lose > threshold) return sacrifice.awful(this.locale)

    return sacrifice.neutral(this.locale)
  }

  perform() {
    const thrown_symbols = handleRequest(this.throw, this.rolls)
    const vs_symbols = handleRequest(this.vs, this.rolls)

    const compared = thrown_symbols.map((elem, idx) => compare(elem, vs_symbols[idx]))

    const result_lines = [
      present({
        vs_request: this.vs,
        rolls: this.rolls,
        thrown: thrown_symbols,
        vs: vs_symbols,
        compared,
        description: this.description,
        locale: this.locale,
      }),
    ]

    if (sacrifice.hasTrigger(this.description, this.locale)) {
      const sacrifice_message = this.judge(compared)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    if (advice.showAdvice()) {
      result_lines.push(`-# ${advice.message(this.locale)}`)
    }

    return result_lines.join("\n")
  }
}
