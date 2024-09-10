const { bold } = require("discord.js")

const { pluralize } = require("../util/pluralize")

/**
 * Class to more conveniently handle the complex presentation logic for a /nwod roll
 *
 * The presenter is designed to handle a single roll or set of identical rolls. It must not be reused for
 * different inputs.
 */
class NwodPresenter {
  /**
   * Create a new NwodPresenter object
   *
   * @param  {Int}       options.pool        Number of dice rolled
   * @param  {Int}       options.rolls       Number of rolls made
   * @param  {bool}      options.chance      Whether this is the result of a chance roll
   * @param  {bool}      options.rote        Whether this is the result of a rote roll
   * @param  {Int}       options.threshold   Threshold for success
   * @param  {Bool}      options.explode     Whether 10s were re-rolled
   * @param  {Int}       options.until       Target number of successes from multiple rolls
   * @param  {bool}      options.decreasing  Whether the pool of subsequent rolls is lowered
   * @param  {String}    options.description Text describing the roll
   * @param  {Array<int[]>} options.raw      Array of one array with ints representing raw dice rolls
   * @param  {int[]}     options.summed      Array of one int, summing the rolled dice
   */
  constructor({ pool, rolls, chance, rote, threshold, explode, until, decreasing, description, raw, summed }) {
    this.pool = pool
    this.rolls = rolls
    this.chance = chance
    this.rote = rote
    this.threshold = threshold
    this.explode = explode
    this.until = until
    this.description = description
    this.raw = raw
    this.summed = summed
    this.decreasing = decreasing
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
        content += ` until ${this.until} successes`
        content += this.explainRolls()
        content += ` at ${this.explainPool()}:`
        content += this.presentResultSet()

        const finalSum = this.summed.reduce((prev, curr) => prev + curr, 0)
        content += `\n${bold(finalSum)} of ${this.until} in ${this.raw.length} rolls`
        break
      case "many":
        content += this.presentedDescription
        content += `${this.explainRolls()} times with ${this.explainPool()}:`
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
   * Show a hummingbird easter egg under just the right conditions
   *
   * @return {string} Empty string, or a hummingbird statement
   */
  get hummingbird() {
    const lower_desc = this.description?.toLowerCase()
    if (
      this.summed[0] == 11 &&
      lower_desc &&
      (lower_desc.includes("perception") || lower_desc.includes("perceive"))
    ) {
      return "\nYou saw the hummingbird!"
    }

    return ""
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
   * Explain the number of rolls
   *
   * In many mode, this will describe the total rolls made. In until mode, this will indicate the maximum
   * number of allowed rolls. In single mode, this returns an empty string.
   *
   * @return {str} Formatted description of rolls
   */
  explainRolls() {
    if (this.rolls === 1) return ""

    const content = ` ${this.rolls} times`

    if (this.until) return ` (max${content})`
    return content
  }

  /**
   * Explain the dice pool used
   *
   * This includes breakdowns for the rote, threshold, and explode options.
   *
   * In chance mode, the string "a chance die" replaces the count of dice, since the base pool is always one.
   *
   * @return {str} Formatted dice pool explanation
   */
  explainPool() {
    let content = `${this.pool}`
    if (this.chance) {
      content = "a chance"
    }

    content += " " + pluralize("die", this.pool)

    content += this.explainRote()
    content += this.explainThreshold()
    content += this.explainExplode()
    content += this.explainDecreasing()

    return content
  }

  /**
   * Get text describing the rote flag
   *
   * @return {str} Brief description of the rote flag, or empty if flag is false
   */
  explainRote() {
    if (this.rote) return " with rote"
    return ""
  }

  /**
   * Get text describing the success threshold
   *
   * >=8: empy string
   * other: "succeeding on 9 and up"
   *
   * @return {String} Brief description of the success threshold
   */
  explainThreshold() {
    if (this.threshold == 8) return ""

    let content = ` succeeding on ${this.threshold}`
    if (this.threshold < 10) content += " and up"

    return content
  }

  /**
   * Get text describing the n-again option
   *
   * For 10-again: empty string
   * <10-again: "with 8-again"
   * >10: "with no 10-again"
   *
   * @return {String} Brief description of the n-again in play
   */
  explainExplode() {
    if (this.explode == 10) return ""
    if (this.explode > 10) return " with no 10-again"
    return ` with ${this.explode}-again`
  }

  /**
   * Get text describing the decreasing flag
   *
   * @return {str} Brief description of the decreasing flag, or empty if flag is false
   */
  explainDecreasing() {
    if (this.decreasing) return ", decreasing"
    return ""
  }

  /**
   * Explain a single result
   *
   * If it's a chance roll, then a raw die of 1 is a dramatic failure.
   * Otherwise, return the summed result as usual.
   *
   * @param  {int} result_index Index in the raw resultset of the result to present
   * @return {str}              A string describing the result
   */
  explainTally(result_index) {
    if (this.rollChance(result_index) && this.raw[result_index][0] === 1) {
      return `a ${bold("dramatic failure")}`
    }
    return bold(this.summed[result_index])
  }

  /**
   * Annotate the dice of a single result
   *
   * Success dice are bold, and re-rolls get an explamation point.
   *
   * @param  {int} result_index Index in the raw resultset of the result to present
   * @return {str}              Annotated dice results
   */
  notateDice(result_index) {
    let idx_mod = 0
    let skip = false
    return this.raw[result_index]
      .map((die, idx) => {
        if (die >= this.rollThreshold(result_index)) {
          if (die >= this.explode) {
            idx_mod--
            skip = true
            if (this.rote && this.rollChance(result_index) && idx === 0) {
              // use the elusive double bang when a chance die has rote and rolls a 10
              return bold(`${die}!!`)
            }
            // bold and bang re-roll successes
            return bold(`${die}!`)
          }
          // bold normal successes
          return bold(die)
        } else if (this.rote && idx + idx_mod < this.rollPool(result_index)) {
          if (this.rollChance(result_index) && idx === 0 && die === 1) {
            // a dramatic failure on the first die does not get a rote re-roll
            return die
          }
          if (skip) {
            // n-again re-rolls don't get rolled again for rote
            skip = false
            return die
          }
          // failures in the initial pool are rolled again for rote
          return `${die}!`
        }
        return die
      })
      .join(", ")
  }

  /**
   * Get the pool for a given roll
   *
   * When decreasing is true, a roll's pool is decreased by one for each after the first.
   *
   * @param  {int}  idx Index of the roll
   * @return {bool}     Number of dice in the pool
   */
  rollPool(idx) {
    if (this.decreasing) return this.pool - idx
    return this.pool
  }

  /**
   * Get whether a particular roll was a chance die
   *
   * When decreasing is true, a roll can become a chance die if its pool is reduced to zero.
   *
   * @param  {int}  idx Index of the roll
   * @return {bool}     True if that roll was a chance die, false if not
   */
  rollChance(idx) {
    if (this.decreasing) return idx >= this.pool
    return this.chance
  }

  /**
   * Get the success threshold for a roll
   *
   * When a pool turns into a chance die due to decreasing, the threshold automatically becomes 10.
   *
   * @param  {int} idx Index of the roll
   * @return {int}     Threshold for success
   */
  rollThreshold(idx) {
    if (this.rollChance(idx)) return 10
    return this.threshold
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
   * Present one or more results from the roll command
   *
   * This is the main entry point for the nwod presenter. It's best to use this function instead of manually
   * creating and using an NwodPresenter object.
   *
   * @param  {...options} options.rollOptions Roll options and results
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new NwodPresenter(rollOptions)
    return presenter.presentResults()
  },
  NwodPresenter,
}
