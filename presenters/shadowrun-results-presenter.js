const { bold, userMention } = require("discord.js")

/**
 * Class to more conveniently handle the complex presentation logic for a shadowrun roll
 *
 * The presenter is designed to handle a single roll or set of identical rolls. It must not be reused for
 * different rolls.
 */
class ShadowrunPresenter {
  /**
   * Create a new NwodPresenter object
   *
   * @param  {Int}       options.pool        Number of dice rolled
   * @param  {Bool}      options.edge        Whether 6s were re-rolled
   * @param  {Int}       options.until       Target number of successes from multiple rolls
   * @param  {String}    options.description Text describing the roll
   * @param  {Array<int[]>} options.raw      Array of one array with ints representing raw dice rolls
   * @param  {int[]}     options.summed      Array of one int, summing the rolled dice
   */
  constructor({ pool, edge, until, description, raw, summed }) {
    this.pool = pool
    this.edge = edge
    this.until = until
    this.description = description
    this.raw = raw
    this.summed = summed
  }

  /**
   * Get the number of rolls made in our result set
   *
   * @return {int} Number of rolls made
   */
  get rolls() {
    return this.raw.length
  }

  /**
   * Get the mode we're operating under
   *
   * @return {string} Presentation mode based on number of rolls and the "until" option
   */
  get mode() {
    if (this.until) {
      return "until"
    } else if (this.rolls > 1) {
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
      case "until":
        content += this.presentedDescription
        content += ` until ${this.until} successes at ${this.explainPool()}:`
        content += this.presentResultSet()

        const finalSum = this.summed.reduce((prev, curr) => prev + curr, 0)
        content += `\n${bold(finalSum)} of ${this.until} in ${this.rolls} rolls`
        break
      case "many":
        content += this.presentedDescription
        content += ` ${this.rolls} times with ${this.explainPool()}:`
        content += this.presentResultSet()
        break
      case "one":
        content += ` ${this.explainTally(0)}`
        content += this.presentedDescription
        content += ` (${this.explainPool()}: [${this.notateDice(0)}])`
        content += this.hummingbird
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

  explainPool() {
    //
  }

  notateDice(result_index) {
    //
  }

  explainTally(result_index) {
    //
  }

  /**
   * Describe the results of all rolls
   *
   * @return {str} String describing the roll results
   */
  presentResultSet() {
    return this.raw
      .map((result, index) => {
        return `\n\t${this.explainTally(index)} (${this.notateDice(index)})`
      })
      .join("")
  }
}

module.exports = {
  /**
   * Present one or more results from the shadowrun command
   *
   * This is the main entry point for the shadowrun presenter. It's best to use this function instead of
   * manually creating and using a ShadowrunPresenter object.
   *
   * @param  {...options} options.rollOptions Roll options and results
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new ShadowrunPresenter(rollOptions)
    return presenter.presentResults()
  },
  ShadowrunPresenter,
}
