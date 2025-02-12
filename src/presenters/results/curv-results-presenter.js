const { strikethrough, bold } = require("discord.js")
const { operator } = require("../../util/formatters")
const { i18n } = require("../../locales")

class CurvPresenter {
  /**
   * Create a new CurvPresenter object
   *
   * @param {Array<Array<int[]>>} raw         Array of raw result numbers, grouped by the roll they're a part of, then by the pool in that roll
   * @param {int[]}               picked      Array of pool indexes, indicating which was picked for each roll
   * @param {Array<int[]>}        sums        Array of pool sums
   * @param {int}                 rolls       Number of pools rolled
   * @param {str}                 keep        The method used to pick dice to keep. One of "all", "highest", or "lowest".
   * @param {str}                 description Text describing the roll
   * @param {int}                 modifier    Number to add to each pool result
   */
  constructor({ raw, picked, sums, rolls, keep, description, modifier, locale = "en-US" }) {
    this.raw = raw
    this.picked = picked
    this.sums = sums
    this.rolls = rolls
    this.keep = keep
    this.description = description
    this.modifier = modifier ?? 0
    this.t = i18n.getFixedT(locale, "commands", "curv")
  }

  /**
   * Get the mode we're operating under
   *
   * @return {string} Presentation mode based on number of rolls
   */
  get mode() {
    if (this.rolls > 1) {
      return "many"
    } else {
      return "one"
    }
  }

  /**
   * Present the results of our rolls
   *
   * @return {str} A string describing the results of our roll(s)
   */
  presentResults() {
    const key_parts = ["response"]
    const t_args = {
      count: this.rolls,
    }

    if (this.mode === "many") {
      t_args.results = this.presentResultSet()
    } else {
      t_args.result = this.explainOutcome(0)
      t_args.explanation = this.explainRoll(0) + this.explainModifier()
    }

    if (this.description) {
      key_parts.push("withDescription")
      t_args.description = this.description
    } else {
      key_parts.push("withoutDescription")
    }

    if (this.keep === "highest") {
      key_parts.push("advantage")
    } else if (this.keep === "lowest") {
      key_parts.push("disadvantage")
    } else {
      key_parts.push("simple")
    }

    const key = key_parts.join(".")
    return this.t(key, t_args)
  }

  /**
   * Show the outcome of a given roll
   *
   * This usually shows a bolded sum. If the dice sum is 16 or more, it notes that the outcome is a critical
   * success as well as showing the final sum.
   *
   * @param  {int} rollIndex Index of the roll to sum
   * @return {str}           Summed dice from the roll after keep is applied, plus modifier
   */
  explainOutcome(rollIndex) {
    const picked_index = this.picked[rollIndex]
    const dice_sum = this.sums[rollIndex][picked_index]
    const final_sum = dice_sum + this.modifier

    if (dice_sum >= 16) return this.t("result.crit", { sum: final_sum })
    if (dice_sum <= 5) return this.t("result.fail", { sum: final_sum })

    return this.t("result.normal", { sum: final_sum })
  }

  /**
   * Break down the pools used in a given roll
   *
   * Shows the dice in each pool as well as that pool's sum. When keep is set, also strikes the pool which was
   * dropped.
   *
   * @param  {int} rollIndex Index of the roll to show
   * @return {str}           Formatted string showing the dice of each pool
   */
  explainRoll(rollIndex) {
    return this.raw[rollIndex]
      .map((raw_roll, roll_idx) => {
        const result = `${this.sums[rollIndex][roll_idx]} [${raw_roll}]`
        if (this.picked[rollIndex] !== roll_idx) return strikethrough(result)
        return result
      })
      .join(", ")
  }

  /**
   * Get modifier text
   *
   * @return {str} Modifier with its signed operator, or empty string with no modifier
   */
  explainModifier() {
    if (!this.modifier) return ""

    return operator(this.modifier)
  }

  /**
   * Show the outcome of multiple rolls
   *
   * @return {str[]} Formatted roll results
   */
  presentResultSet() {
    return this.raw
      .map((roll, roll_idx) => {
        return `${this.explainOutcome(roll_idx)} (${this.explainRoll(roll_idx)}${this.explainModifier(roll_idx)})`
      })
  }
}

module.exports = {
  /**
   * Present one or more results from the curv command
   *
   * This is the main entry point for the curv presenter. It's best to use this function instead of
   * manually creating and using a WodPresenter object.
   *
   * @param  {...options} options.rollOptions Roll options and results
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new CurvPresenter(rollOptions)
    return presenter.presentResults()
  },
  CurvPresenter,
}
