const { bold, underline, italic, strikethrough, Collection } = require("discord.js")

const { indeterminate } = require("../../util/formatters")
const { i18n } = require("../../locales")

/**
 * Map of talent keywords to displayable names
 *
 * @type {Collection<str, str>}
 */
const talentNames = new Collection([
  ["minor", "Minor Exhaustion"],
  ["major", "Major Exhaustion"],
  ["madness", "Madness"],
])

/**
 * List of strength names in descending order
 *
 * Order is used for breaking ties if all die results are identical.
 *
 * @type {str[]}
 */
const strengthPrecedence = ["discipline", "madness", "exhaustion", "pain"]

class DrhPresenter {
  /**
   * Array of results for each test
   *
   * Length should match value of rolls.
   *
   * @type {Array<DrhRoll[]>}
   */
  tests

  /**
   * Description for the rolls
   *
   * @type {str}
   */
  description

  /**
   * Name of the talent used
   *
   * @type {str | undefined}
   */
  talent

  /**
   * Number of rolls that were made
   *
   * @type {int}
   */
  rolls

  t

  constructor({ tests, description, talent = "none", rolls, locale = "en-US" } = {}) {
    this.tests = tests
    this.description = description
    this.talent = talent
    this.rolls = rolls
    this.t = i18n.getFixedT(locale, "commands", "drh")
  }

  /**
   * Get the mode we're operating under
   *
   * @return {string} Presentation mode based on number of rolls and the "until" option
   */
  get mode() {
    if (this.rolls > 1) {
      return "many"
    } else {
      return "one"
    }
  }

  /**
   * Present the result of our rolls
   *
   * @return {str} Presented roll results
   */
  presentResults() {
    const t_args = {
      description: this.description,
      count: this.rolls,
    }

    const key_parts = ["response"]
    if (this.description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }
    key_parts.push(this.talent)

    if (this.rolls === 1) {
      const roll_presenter = new DrhRollPresenter({
        strengths: this.tests[0],
        talent: this.talent,
      })
      t_args.pools = roll_presenter.present()
      t_args.result = this.t(
        `response.result.${roll_presenter.result}.${roll_presenter.dominating_strength}`,
      )
    } else {
      t_args.results = this.tests
        .map((pools) => {
          const roll_presenter = new DrhRollPresenter({
            strengths: pools,
            talent: this.talent,
          })
          const lines = [
            this.t(
              `response.result.${roll_presenter.result}.${roll_presenter.dominating_strength}`,
            ),
            roll_presenter.present(),
          ]
          return lines.join("\n")
        })
        .join("\n")
    }

    const key = key_parts.join(".")
    return this.t(key, t_args)
  }
}

class DrhRollPresenter {
  /**
   * The pools of this roll
   *
   * @type {DrhPool[]}
   */
  strengths

  /**
   * The name of the talent used
   *
   * @type {str}
   */
  talent

  /**
   * The name of the strength which dominates the roll
   *
   * @type {str}
   */
  dominating_strength

  /**
   * The feature of the dominating strength which caused it to win
   *
   * Always a string, but the charcter may be numeric or the name of the dominating pool.
   *
   * @type {str}
   */
  dominating_feature

  constructor({ strengths, talent }) {
    this.strengths = strengths
    this.talent = talent
    this.setDominating()
  }

  /**
   * Determine which strength dominates our roll
   *
   * Strengths are compared by the number of dice showing a result, from 6 to 1. Then they're compared by name
   * using the order defined in strengthPrecedence.
   *
   * This has the side effect of sorting the strengths collection.
   */
  setDominating() {
    const tied = this.strengths.clone()
    let feature = 6
    while (feature) {
      const max_dice = Math.max(...tied.map((pool) => pool.spread[feature]))
      tied.sweep((pool) => pool.spread[feature] < max_dice)
      if (tied.size == 1) {
        this.dominating_strength = tied.first().name
        this.dominating_feature = feature.toString()
        return
      }
      feature -= 1
    }

    for (const pool_name of strengthPrecedence) {
      if (!tied.get(pool_name)) continue
      this.dominating_strength = pool_name
      this.dominating_feature = pool_name
      return
    }
  }

  /**
   * Present all the roll's strengths
   *
   * Strengths are listed in dominance order: discipline, madness, exhaustion, then pain. The subtotal is
   * shown in comparison to the pain total, as that determine's the roll's outcome.
   *
   * Each line of the output is prefixed with a tab character (\t) for convenience.
   *
   * @return {str} String describing all the roll's strengths
   */
  present() {
    const strength_order = strengthPrecedence.slice(0, 3).filter((name) => this.strengths.has(name))
    const content = strength_order
      .map((strength_name) => `\t${this.explainStrength(strength_name)}`)
      .join("\n")
    return content + `\n\t${this.presentedTotal} vs ${this.explainStrength("pain")}`
  }

  /**
   * Total successes in all non-pain strengths
   *
   * @return {int} Added sums from all strengths other than "pain"
   */
  get playerSubtotal() {
    if (this._subtotal === undefined) {
      this._subtotal = this.strengths
        .filter((p) => p.name != "pain")
        .reduce((acc, pool) => acc + pool.successes, 0)
    }
    return this._subtotal
  }

  /**
   * The dice pool of the exhaustion strength
   *
   * @return {int} Dice pool from the exhaustion strength
   */
  get exhaustionPool() {
    return this.strengths.get("exhaustion")?.size ?? 0
  }

  /**
   * Get the total successes after applying the talent
   *
   * A major talent adds the exhaustion strength's pool to the subtotal.
   *
   * A minor talent uses the higher of the subtotal or the exhaustion strength's pool.
   *
   * @return {int} Player subtotal modified by the talent
   */
  get playerTotal() {
    switch (this.talent) {
      case "major":
        return this.playerSubtotal + this.exhaustionPool
      case "minor":
        return Math.max(this.playerSubtotal, this.exhaustionPool)
      default:
        return this.playerSubtotal
    }
  }

  /**
   * Present the player's total successes
   *
   * With a major exhaustion talent, this looks like `_3 (1 + 2)_`.
   *
   * With a minor exhaustion talent and low successes, this looks like `_~~2~~ 3_`.
   *
   * Otherwise, this looks like `_2_`.
   *
   * @return {str} String explaining the player's total successes.
   */
  get presentedTotal() {
    if (this.talent == "major") {
      return italic(`${this.playerTotal} (${this.playerSubtotal} + ${this.exhaustionPool})`)
    }

    if (this.talent == "minor" && this.exhaustionPool > this.playerSubtotal) {
      return italic(`${strikethrough(this.playerSubtotal)} ${this.exhaustionPool}`)
    }

    return italic(this.playerTotal)
  }

  /**
   * The total successes of the pain strength
   *
   * @return {int} Successes from the pain strength
   */
  get painTotal() {
    return this.strengths.get("pain").successes
  }

  /**
   * The final result
   *
   * Compares the player total against the pain total, capped at 4. Failure is index 5.
   *
   * @return {int} Roll result
   */
  get result() {
    if (this.playerTotal >= this.painTotal) {
      const degree = Math.min(4, this.playerTotal - this.painTotal)
      return degree
    }
    return 5
  }

  /**
   * Explain the result of a single strength
   *
   * Includes the successes, name, and dice breakdown.
   *
   * @example
   * ```js
   * presenter.explainStrength("pain")
   * // 2 pain (**3**, 4, **1**)
   * ```
   *
   * If the pool is dominating, the number or name will be
   * underlined.
   *
   * @example
   * ```js
   * presenter.explainStrength("pain")
   * // 2 pain (**3**, __6__, **1**)
   * ```
   *
   * @param  {str} strength_name Name of the strength to present
   * @return {str}               Details of the strength
   */
  explainStrength(strength_name) {
    const strength = this.strengths.get(strength_name)

    let content = `${strength.successes} ${strength_name} (`
    content += strength.dice.map((die) => (die < 4 ? bold(die) : `${die}`)).join(", ")
    content += ")"

    if (this.dominating_strength != strength_name) return content

    return content.replaceAll(this.dominating_feature, underline(this.dominating_feature))
  }
}

module.exports = {
  /**
   * Present one or more results from the drh command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new DrhPresenter(rollOptions)
    return presenter.presentResults()
  },
  DrhPresenter,
  DrhRollPresenter,
  talentNames,
}
