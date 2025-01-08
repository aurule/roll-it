const { bold } = require("discord.js")

const { pluralize } = require("../../util/formatters")
const { i18n } = require("../../locales")

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
  constructor({
    pool,
    rolls,
    chance,
    rote,
    threshold,
    explode,
    until,
    decreasing,
    description,
    raw,
    summed,
    locale = "en-US",
  } = {}) {
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
    this.t = i18n.getFixedT(locale, "commands", "nwod")
  }

  /**
   * Present the results of our rolls
   *
   * @return {str} A string describing the results of our roll(s)
   */
  presentResults() {
    const t_args = {
      description: this.description,
      results: this.raw
        .map((result, index) => {
          return (
            "\t" +
            this.t("response.result", { tally: this.xtally(index), detail: this.notateDice(index) })
          )
        })
        .join("\n"),
      tally: this.xtally(0),
      detail: this.notateDice(0),
      pool: this.xpool(),
    }

    const key_parts = ["response"]
    if (this.until) {
      t_args.until = this.t("response.target-desc", { count: this.until })
      t_args.count = this.raw.length
      t_args.rolls = this.t("response.rolls", { count: this.rolls })
      t_args.final = this.summed.reduce((prev, curr) => prev + curr, 0)
      t_args.target = this.until
      key_parts.push("until")
      const capped = this.rolls === 1 ? "unlimited" : "limited"
      key_parts.push(capped)
    } else {
      t_args.count = this.rolls
      key_parts.push("regular")
    }

    if (this.description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    const content = this.t(key, t_args)

    // handle hummingbird easter egg
    // if summed[0] == 11 and has a description and description includes t("response.hummingbird.triggers")
    // insert t("response.hummingbird.message") into content

    return content
  }

  xtally(result_index) {
    if (this.rollChance(result_index) && this.raw[result_index][0] === 1) {
      return this.t("response.tally.fail")
    }
    return this.t("response.tally.number", { tally: this.summed[result_index] })
  }

  xpool() {
    const dice_key = this.chance ? "response.pool.dice.chance" : "response.pool.dice.total"
    const dice = this.t(dice_key, { count: this.pool })

    const threshold_key =
      this.threshold === 10 ? "response.pool.threshold.max" : "response.pool.threshold.lower"
    const threshold = this.t(threshold_key, { threshold: this.threshold })

    const explode_key =
      this.explode > 10 ? "response.pool.explode.none" : "response.pool.explode.less"
    const explode = this.t(explode_key, { explode: this.explode })

    const key_parts = ["response.pool.explanation"]

    if (this.rote) key_parts.push("rote")
    if (this.threshold !== 8) key_parts.push("threshold")
    if (this.explode !== 10) key_parts.push("explode")
    if (this.decreasing) {
      key_parts.push("decreasing")
    } else {
      key_parts.push("solo")
    }

    const key = key_parts.join(".")
    return this.t(key, { dice, threshold, explode })
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
