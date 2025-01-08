const { bold, strikethrough, underline } = require("discord.js")
const { i18n } = require("../../locales")

class WodPresenter {
  /**
   * Create a new WodPresenter object
   *
   * @param  {Int}       options.pool        Number of dice rolled
   * @param  {int}       options.difficulty  Threshold for success
   * @param  {bool}      options.specialty   Whether 10s count two successes
   * @param  {Int}       options.rolls       Number of rolls made
   * @param  {Int}       options.until       Target number of successes from multiple rolls
   * @param  {String}    options.description Text describing the roll
   * @param  {Array<int[]>} options.raw      Array of one array with ints representing raw dice rolls
   * @param  {int[]}     options.summed      Array of one int, summing the rolled dice
   */
  constructor({
    pool,
    difficulty,
    specialty,
    rolls = 1,
    until,
    description,
    raw,
    summed,
    locale = "en-US",
  } = {}) {
    this.pool = pool
    this.difficulty = difficulty
    this.specialty = specialty
    this.rolls = rolls
    this.until = until
    this.description = description
    this.raw = raw
    this.summed = summed
    this.t = i18n.getFixedT(locale, "commands", "wod20")
  }

  /**
   * Present the results of our rolls
   *
   * @return {str} A string describing the results of our roll(s)
   */
  presentResults() {
    const t_args = {
      count: this.raw.length,
      description: this.description,
      pool: this.explainPool(),
      tally: this.explainTally(0),
      detail: this.notateDice(0),
      results: this.raw
        .map((result, idx) => {
          const res_args = {
            tally: this.explainTally(idx),
            detail: this.notateDice(idx),
          }
          return "\t" + this.t("response.result", res_args)
        })
        .join("\n"),
    }

    const key_parts = ["response"]
    if (this.until) {
      key_parts.push("until")
      t_args.target = this.until
      t_args.until = this.t("response.target-desc", { count: this.until })
      t_args.final = this.summed.reduce((prev, curr) => prev + curr, 0)

      if (this.rolls > 1) {
        key_parts.push("limited")
        t_args.rolls = this.t("response.rolls", { count: this.rolls })
      } else {
        key_parts.push("unlimited")
      }
    } else {
      key_parts.push("regular")
    }

    if (this.description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    return this.t(key, t_args)
  }

  /**
   * Explain the dice pool
   *
   * @return {str} String describing the number of dice in the pool and their roll-again, if present
   */
  explainPool() {
    const pool_args = {
      pool: this.pool,
      difficulty: this.difficulty,
      context: this.specialty ? "specialty" : undefined,
    }
    return this.t("response.pool", pool_args)
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
    return this.raw[result_index]
      .map((die) => {
        if (die === 1) return strikethrough(die)
        if (die >= this.difficulty) {
          if (this.specialty && die === 10) return bold(underline(die))
          return bold(die)
        }
        return die.toString()
      })
      .join(", ")
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
    const tally_args = {
      tally: Math.max(0, this.summed[result_index]),
      context: this.botch(result_index) ? "botch" : undefined,
    }
    return this.t("response.tally", tally_args)
  }

  /**
   * Get whether a pool is a botch
   *
   * @param  {int} result_index Index of the roll to test
   * @return {bool}             True if the roll results has 1s and no successes, false otherwise
   */
  botch(result_index) {
    const ones = this.raw[result_index].filter((d) => d === 1).length
    return ones > 0 && ones === -1 * this.summed[result_index]
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
