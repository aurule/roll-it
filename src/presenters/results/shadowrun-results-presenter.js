import { strikethrough, bold } from "discord.js"

import { i18n } from "../../locales/index.js"

/**
 * Class to more conveniently handle the complex presentation logic for a shadowrun roll
 *
 * The presenter is designed to handle a single roll or set of identical rolls. It must not be reused for
 * different rolls.
 */
export class ShadowrunPresenter {
  /**
   * Create a new ShadowrunPresenter object
   *
   * @param  {number}     options.pool        Number of dice rolled
   * @param  {boolean}    options.edge        Whether 6s were re-rolled
   * @param  {number}     options.rolls       Number of rolls made
   * @param  {number}     options.until       Target number of successes from multiple rolls
   * @param  {string}     options.description Text describing the roll
   * @param  {number[][]} options.raw         Array of one array with ints representing raw dice rolls
   * @param  {string}     options.locale      Name of the locale to use to look up stings
   * @param  {number[]}   options.summed      Array of one int, summing the rolled dice
   */
  constructor({
    pool,
    edge = false,
    rolls = 1,
    until,
    description,
    raw,
    summed,
    locale = "en-US",
  } = {}) {
    this.pool = pool
    this.edge = edge
    this.rolls = rolls
    this.until = until
    this.description = description
    this.raw = raw
    this.summed = summed
    this.t = i18n.getFixedT(locale, "commands", "shadowrun")
  }

  /**
   * Present the results of our rolls
   *
   * @return {string} A string describing the results of our roll(s)
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
   * @return {string} String describing the number of dice in the pool and their roll-again, if present
   */
  explainPool() {
    let key = "response.pool.bare"
    if (this.edge) {
      key = "response.pool.edge"
    }
    return this.t(key, { count: this.pool })
  }

  /**
   * Annotate the raw results with styling
   *
   * Successes are in bold, ones are struck
   *
   * @param  {number} result_index Index of the roll to notate
   * @return {string}              String with stylized die results
   */
  notateDice(result_index) {
    return this.raw[result_index]
      .map((die) => {
        if (die >= 5) return bold(die)
        if (die === 1) return strikethrough(die)
        return die.toString()
      })
      .join(", ")
  }

  /**
   * Explain the result
   *
   * Shows the number of successes and glitch status
   *
   * @param  {number} result_index Index of the roll result to explain
   * @return {string}              String with successes and glitch status
   */
  explainTally(result_index) {
    const tally = this.summed[result_index]
    const glitch = this.glitch(result_index)

    let key = "response.tally.regular"
    if (glitch) {
      if (tally === 0) {
        key = "response.tally.crit-glitch"
      } else {
        key = "response.tally.glitch"
      }
    }
    return this.t(key, { tally })
  }

  /**
   * Get whether a pool has a glitch
   *
   * @param  {number} result_index Index of the roll to test
   * @return {boolean}             True if the roll results are more than half 1s, false if not
   */
  glitch(result_index) {
    const half = Math.floor(this.pool / 2)
    const ones = this.raw[result_index].filter((d) => d === 1).length

    return ones > half
  }
}

/**
 * Present one or more results from the shadowrun command
 *
 * This is the main entry point for the shadowrun presenter. It's best to use this function instead of
 * manually creating and using a ShadowrunPresenter object.
 *
 * @param  {...options} options.rollOptions Roll options and results
 * @return {string}                         String describing the roll results
 */
export function present({ ...rollOptions }) {
  const presenter = new ShadowrunPresenter(rollOptions)
  return presenter.presentResults()
}
