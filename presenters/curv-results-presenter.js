const { strikethrough, bold } = require("discord.js")
const { added } = require("./addition-presenter")

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
  constructor({ raw, picked, sums, rolls, keep, description, modifier }) {
    this.raw = raw
    this.picked = picked
    this.sums = sums
    this.rolls = rolls
    this.keep = keep
    this.description = description
    this.modifier = modifier ?? 0
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
    let content = "{{userMention}} rolled"

    switch (this.mode) {
      case "many":
        content += this.presentedDescription
        content += this.explainRolls()
        content += this.explainAdvantage()
        content += ":\n"
        content += this.presentResultSet()
        break
      case "one":
        content += ` ${this.explainOutcome(0)}`
        content += this.presentedDescription
        content += this.explainAdvantage()
        content += ` (${this.explainRoll(0)}`
        content += this.explainModifier()
        content += ")"
        break
    }

    return content
  }

  /**
   * Format the description
   *
   * Formatted string accounts for whether the description is present and whether we're presenting a single
   * roll or multiples.
   *
   * @return {str} Formatted description string
   */
  get presentedDescription() {
    if (!this.description) return ""

    if (this.mode == "one") return ` for "${this.description}"`

    return ` "${this.description}"`
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

    if (dice_sum >= 16) return `${bold("a crit!")} with ${final_sum}`

    return bold(final_sum)
  }

  /**
   * Describe the kept dice
   *
   * This translates back from the internal keep strategies to D&D-friendly advantage and disadvantage.
   *
   * @return {str} Formatted description of which dice were kept
   */
  explainAdvantage() {
    switch (this.keep) {
      case "highest":
        return " with advantage"
      case "lowest":
        return " with disadvantage"
      default:
        return ""
    }
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

    return added(this.modifier)
  }

  /**
   * Show the outcome of multiple rolls
   *
   * @return {str} Formatted roll results
   */
  presentResultSet() {
    return this.raw
      .map((roll, roll_idx) => {
        return `\t${this.explainOutcome(roll_idx)} (${this.explainRoll(roll_idx)}${this.explainModifier(roll_idx)})`
      })
      .join("\n")
  }

  /**
   * Show the number of rolls made
   *
   * @return {str} Description of the number of rolls
   */
  explainRolls() {
    return ` ${this.rolls} times`
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
