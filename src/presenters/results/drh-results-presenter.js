const { bold, underline, italic, strikethrough, Collection } = require("discord.js")
const { sum } = require("mathjs")

const { indeterminate } = require("../../util/formatters")
const { i18n } = require("../../locales")

/**
 * List of strength names in descending order
 *
 * Order is used for breaking ties if all die results are identical.
 *
 * @type {str[]}
 */
const strengthPrecedence = ["discipline", "madness", "exhaustion", "pain"]

/**
 * Class to show the outcome of one or more drh tests
 */
class DrhPresenter {
  /**
   * Array of results for each test
   *
   * Length should match value of rolls.
   *
   * @type {Collection<DrhRoll>[]}
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

  /**
   * Value to add to the player total
   *
   * @type {int}
   */
  modifier

  /**
   * Name of the locale for getting response strings
   *
   * @type {str}
   */
  locale

  /**
   * Translation function
   *
   * @type {callable}
   */
  t

  constructor({ tests, description, talent = "none", rolls, modifier = 0, locale = "en-US" } = {}) {
    this.tests = tests
    this.description = description
    this.talent = talent
    this.rolls = rolls
    this.modifier = modifier
    this.locale = locale
    this.t = i18n.getFixedT(locale, "commands", "drh")
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

    const key_parts = ["response.normal"]
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
        modifier: this.modifier,
        locale: this.locale,
      })
      t_args.pools = roll_presenter.present()
      t_args.result = this.t(
        `response.normal.result.${roll_presenter.result}.${roll_presenter.dominating_strength}`,
      )
    } else {
      t_args.results = this.tests
        .map((pools) => {
          const roll_presenter = new DrhRollPresenter({
            strengths: pools,
            talent: this.talent,
            modifier: this.modifier,
            locale: this.locale,
          })
          const lines = [
            this.t(
              `response.normal.result.${roll_presenter.result}.${roll_presenter.dominating_strength}`,
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

/**
 * Class to show the details of a single roll, with multiple pools
 */
class DrhRollPresenter {
  /**
   * The pools of this roll
   *
   * @type {Collection<DrhPool>}
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

  /**
   * Value to add to the player total
   *
   * @type {int}
   */
  modifier

  /**
   * Translation function
   *
   * @type {callable}
   */
  t

  constructor({ strengths, talent, modifier = 0, locale = "en-US" } = {}) {
    this.strengths = strengths
    this.talent = talent
    this.modifier = modifier
    this.setDominating()

    this.t = i18n.getFixedT(locale, "commands", "drh")
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
   * List of values that make up the final exhaustion total
   *
   * @return {int[]} Array of values that make up the exhaustion subtotal
   */
  get exhaustionValues() {
    return [this.exhaustionPool, this.modifier]
  }

  /**
   * List of values that make up the final player total
   *
   * @return {int[]} Array of values in the player tally
   */
  get playerValues() {
    const values = [this.playerSubtotal, this.modifier]

    if (this.talent === "major") {
      values.push(this.exhaustionPool)
    }

    return values
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
  get finalTotal() {
    const playerTotal = sum(this.playerValues)
    const exhaustionTotal = sum(this.exhaustionValues)

    if (this.talent === "minor") {
      return Math.max(playerTotal, exhaustionTotal)
    }

    return playerTotal
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
      const t_args = {
        total: sum(this.playerValues),
        breakdown: this.playerValues,
      }
      return this.t("response.normal.total.major", t_args)
    }

    if (this.talent == "minor" && this.exhaustionPool > this.playerSubtotal) {
      const t_args = {
        player: sum(this.playerValues),
        total: sum(this.exhaustionValues),
        breakdown: this.exhaustionValues,
        context: this.modifier !== 0 ? "modifier" : undefined,
      }
      return this.t("response.normal.total.minor", t_args)
    }

    const t_args = {
      total: sum(this.playerValues),
      breakdown: this.playerValues,
      context: this.modifier !== 0 ? "modifier" : undefined,
    }
    return this.t("response.normal.total.normal", t_args)
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
    if (this.finalTotal >= this.painTotal) {
      const degree = Math.min(4, this.finalTotal - this.painTotal)
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

/**
 * Class to show the outcome of a helper roll
 */
class DrhTeamworkPresenter {
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
   * Number of rolls that were made
   *
   * @type {int}
   */
  rolls

  /**
   * Name of the locale for getting response strings
   *
   * @type {str}
   */
  locale

  /**
   * Translation function
   *
   * @type {callable}
   */
  t

  constructor({ tests, description, rolls, locale = "en-US" } = {}) {
    this.tests = tests
    this.description = description
    this.rolls = rolls
    this.locale = locale
    this.t = i18n.getFixedT(locale, "commands", "drh")
  }

  /**
   * Create a string describing the overall result of the command invocation
   *
   * @return {str} String describing the results
   */
  presentResults() {
    const key_parts = ["response.helping"]
    let t_args = {
      context: this.description ? "description" : undefined,
      description: this.description,
      count: this.rolls,
    }

    if (this.rolls === 1) {
      t_args.total = this.resultTotal(0)
      t_args.detail = this.resultDetail(0)
    } else {
      t_args.results = this.tests.map((_, idx) => {
        return this.t("response.helping.result", {
          total: this.resultTotal(idx),
          detail: this.resultDetail(idx),
        })
      })
    }

    return this.t("response.helping.reply", t_args)
  }

  /**
   * Get the successes from the description pool of the given roll
   *
   * @param  {int} idx Index to get
   * @return {int}     Total discipline successes from that roll
   */
  resultTotal(idx) {
    const strength = this.tests[idx].get("discipline")

    return strength.successes
  }

  /**
   * Get the successes from the description pool of the given roll
   *
   * @param  {int} idx Index to get
   * @return {str}     Total discipline successes from that roll
   */
  resultDetail(idx) {
    const strength = this.tests[idx].get("discipline")

    return strength.dice.map((die) => (die < 4 ? bold(die) : `${die}`)).join(", ")
  }
}
module.exports = {
  /**
   * Present one or more results from the drh command
   *
   * @param  {obj}    options Roll options
   * @return {String}         String describing the roll results
   */
  present: (options) => {
    let presenter
    if (options.helper) {
      presenter = new DrhTeamworkPresenter(options)
    } else {
      presenter = new DrhPresenter(options)
    }
    return presenter.presentResults()
  },
  DrhPresenter,
  DrhRollPresenter,
  DrhTeamworkPresenter,
}
