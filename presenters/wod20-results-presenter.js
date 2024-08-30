const { bold, strikethrough, underline } = require("discord.js")

class WodPresenter {
  constructor({ pool, difficulty, specialty, until, description, raw, summed }) {
    this.pool = pool
    this.difficulty = difficulty
    this.specialty = specialty
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
   * Explain the dice pool
   *
   * @return {str} String describing the number of dice in the pool and their roll-again, if present
   */
  explainPool() {
    let content = `${this.pool} diff ${this.difficulty}`
    if (this.specialty) content += " with specialty"
    return content
  }

  /**
   * Annotate the raw results with styling
   *
   * Successes are in bold, ones are italicized
   *
   * @param  {int} result_index Index of the roll to notate
   * @return {str}              String with stylized die results
   */
  notateDice(result_index) {
    return this.raw[result_index].map(die => {
      if (die === 1) return strikethrough(die)
      if (die >= this.difficulty) {
        if (this.specialty && die === 10) return bold(underline(die))
        return bold(die)
      }
      return die.toString()
    }).join(", ")
  }

  /**
   * Explain the result
   *
   * Shows the number of successes and botch status
   *
   * @param  {int} result_index Index of the roll result to explain
   * @return {str}              String with successes and botch status
   */
  explainTally(result_index) {
    if (this.botch(result_index)) return bold("botch")
    return bold(Math.max(0, this.summed[result_index]))
  }

  /**
   * Get whether a pool is a botch
   *
   * @param  {int} result_index Index of the roll to test
   * @return {bool}             True if the roll results has 1s and no successes, false otherwise
   */
  botch(result_index) {
    const ones = this.raw[result_index].filter(d => d === 1).length
    return ones > 0 && ones === -1 * this.summed[result_index]
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
   * Present one or more results from the wod20 command
   *
   * This is the main entry point for the wod20 presenter. It's best to use this function instead of
   * manually creating and using a WodPresenter object.
   *
   * @param  {...options} options.rollOptions Roll options and results
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new WodPresenter(rollOptions)
    return presenter.presentResults()
  },
  WodPresenter,
}
