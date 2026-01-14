const { strikethrough, bold } = require("discord.js")

const { i18n } = require("../../locales")

/**
 * Class to more conveniently handle the complex presentation logic for a shadowrun anarchy roll
 *
 * The presenter is designed to handle a single roll or set of identical rolls. It must not be reused for
 * different rolls.
 */
class ShadowrunAnarchyPresenter {
  _glitches = undefined

  /**
   * Create a new ShadowrunAnarchyPresenter object
   *
   * @param {number}     options.pool        Total dice in each roll
   * @param {number}     options.threshold   Threshold for a success
   * @param {number}     options.risk        Number of dice in the pool that are risked
   * @param {number}     options.rolls       Total number of rolls made
   * @param {number}     options.until       Target number of successes from multiple rolls
   * @param {string}     options.description Text describing the roll
   * @param {number[][]} options.raw         Array of one array with ints representing raw dice rolls
   * @param {number[]}   options.summed      Array of one int, summing the rolled dice
   * @param {string}     options.locale      Name of the locale to use to look up stings
   */
  constructor({
    pool,
    threshold,
    risk,
    rolls,
    until,
    description,
    raw,
    summed,
    locale = "en-US",
  } = {}) {
    this.pool = pool
    this.threshold = threshold
    this.risk = risk
    this.rolls = rolls
    this.until = until
    this.description = description
    this.raw = raw
    this.summed = summed
    this.t = i18n.getFixedT(locale, "commands", "sra")
  }

  /**
   * Present the rolled results
   * @return {string} String of described results
   */
  presentResults() {
    const t_args = {
      count: this.raw.length,
      context: this.description ? "description" : undefined,
      description: this.description,
      pool: this.explainPool(),
    }

    let layout
    if (this.until) {
      layout = this.rolls > 1 ? "until.max" : "until.plain"
      t_args.max = this.rolls
      t_args.results = this.raw.map((_roll, idx) => {
        const o_args = {
          count: this.summed[idx],
          context: this.glitches[idx] ? "glitch" : undefined,
          glitch: this.glitchString(this.glitches[idx]),
        }
        const r_args = {
          outcome: this.t("response.outcome", o_args),
          detail: this.detail(idx),
        }
        return this.t("response.layout.result", r_args)
      })
      t_args.target = this.t("response.layout.until.target", { count: this.until })
      t_args.sum = this.t("response.layout.until.sum", {
        sum: this.summed.reduce((acc, sum) => acc + sum, 0),
        count: this.until,
      })
      t_args.rolls = this.t("response.layout.until.rolls", { count: this.raw.length })
    } else if (this.rolls > 1) {
      layout = "many"
      t_args.results = this.raw.map((_roll, idx) => {
        const o_args = {
          count: this.summed[idx],
          context: this.glitches[idx] ? "glitch" : undefined,
          glitch: this.glitchString(this.glitches[idx]),
        }
        const r_args = {
          outcome: this.t("response.outcome", o_args),
          detail: this.detail(idx),
        }
        return this.t("response.layout.result", r_args)
      })
    } else {
      layout = "single"
      const o_args = {
        count: this.summed[0],
        context: this.glitches[0] ? "glitch" : undefined,
        glitch: this.glitchString(this.glitches[0]),
      }
      t_args.outcome = this.t("response.outcome", o_args)
      t_args.detail = this.detail(0)
    }

    return this.t(`response.layout.${layout}`, t_args)
  }

  /**
   * Explain the dice pool
   * @return {string} Breakdown of the pool's parameters
   */
  explainPool() {
    const key = this.risk ? "risking" : "plain"

    const t_args = {
      context: this.advantage,
      dice: this.t("response.pool.dice", { count: this.pool }),
      risk: this.t("response.pool.risk", { count: this.risk }),
    }

    return this.t(`response.pool.${key}`, t_args)
  }

  /**
   * Get a string describing (dis)advantage state
   * @return {string?} One of "advantage" or "disadvantage", or undefined
   */
  get advantage() {
    switch (this.threshold) {
      case 4:
        return "advantage"
      case 6:
        return "disadvantage"
      default:
        return undefined
    }
  }

  /**
   * Get the glitch total for all rolls
   * @return {number[]} Array of glitch totals
   */
  get glitches() {
    if (this._glitches === undefined) {
      this._glitches = this.raw.map(
        (roll) => roll.slice(0, this.risk).filter((r) => r === 1).length,
      )
    }

    return this._glitches
  }

  /**
   * Convert a glitch count into a string
   *
   * Always empty for zero glitches.
   *
   * @param  {number} glitch Total number of glitch dice
   * @return {string}        Translated glitch string
   */
  glitchString(glitch) {
    switch (glitch) {
      case 0:
        return ""
      case 1:
        return this.t("response.glitch.minor")
      case 2:
        return this.t("response.glitch.major")
      default:
        return this.t("response.glitch.critical")
    }
  }

  /**
   * [detail description]
   *
   * The roll [1, 6, 3, 1, 5] is formatted as
   * ```md
   * __*1*, **6!**__, 3, 1, **5**
   * ```
   *
   * This makes use of the non-standard underline formatting that Discord
   * supplies to ensure that the risked dice are highlighted.
   *
   * @param  {number} roll_idx Index of the roll to format
   * @return {string}          Formatted dice
   */
  detail(roll_idx) {
    const risked = []
    const regular = []

    for (const [idx, die] of this.raw[roll_idx].entries()) {
      if (idx < this.risk) {
        switch (true) {
          case die >= this.threshold:
            risked.push(`**${die}!**`)
            break
          case die === 1:
            risked.push(`~~1~~`)
            break
          default:
            risked.push(`${die}`)
            break
        }
        continue
      }
      if (die >= this.threshold) {
        regular.push(`**${die}**`)
      } else {
        regular.push(`${die}`)
      }
    }
    switch (true) {
      case !this.risk:
        return regular.join(", ")
      case this.risk === this.pool:
        return `__${risked.join(", ")}__`
      default:
        return `__${risked.join(", ")}__, ${regular.join(", ")}`
    }
  }
}

module.exports = {
  ShadowrunAnarchyPresenter,
}
