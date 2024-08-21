const { bold, underline, italic, strikethrough, Collection } = require("discord.js")

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
 * Names of the degree of success
 *
 * Indexed by the difference between the player successes and pain successes.
 *
 * @type {str[]}
 */
const successDegrees = [
  "narrow",
  "competant",
  "impressive",
  "extraordinary",
  "fantastic",
]

/**
 * List of strength names in descending order
 *
 * Order is used for breaking ties if all die results are identical.
 *
 * @type {str[]}
 */
const strengthPrecedence = [
  "discipline",
  "madness",
  "exhaustion",
  "pain",
]

class DrhPresenter {
  /**
   * Array of results for each test
   *
   * Length should match value of rolls.
   *
   * @type {Array<DrhRoll[]>}
   */
  tests;

  /**
   * Description for the rolls
   *
   * @type {str}
   */
  description;

  /**
   * Name of the talent used
   *
   * @type {str | undefined}
   */
  talent;

  /**
   * Number of rolls that were made
   *
   * @type {int}
   */
  rolls;

  constructor({ tests, description, talent, rolls }) {
    this.tests = tests
    this.description = description
    this.talent = talent
    this.rolls = rolls
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
    let content = "{{userMention}} rolled"

    switch(this.mode) {
      case "many":
        content += this.presentedDescription()
        content += ` ${this.rolls} times`
        content += this.presentedTalent()
        content += this.tests.map(pools => {
          const roll_presenter = new DrhRollPresenter({strengths: pools, talent: this.talent})
          return `\n${bold(roll_presenter.resultWord)} dominated by ${bold(roll_presenter.dominating_strength)}\n` + roll_presenter.present()
        })
        break
      case "one":
        const roll_presenter = new DrhRollPresenter({strengths: this.tests[0], talent: this.talent})
        content += " a " + bold(roll_presenter.resultWord)
        content += this.presentedDescription()
        content += ` dominated by ${bold(roll_presenter.dominating_strength)}`
        content += this.presentedTalent() + "\n"
        content += roll_presenter.present()
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
  presentedDescription() {
    if (!this.description) return ""

    if (this.mode == "one") return ` for "${this.description}"`

    return ` "${this.description}"`
  }

  /**
   * Format the talent
   *
   * Returned string includes the proper name of the talent as well as connecting words.
   *
   * @return {str} Formatted talent string
   */
  presentedTalent() {
    if (!this.talent) return ""

    return ` using a ${talentNames.get(this.talent)} talent`
  }
}

class DrhRollPresenter {
  /**
   * The pools of this roll
   *
   * @type {DrhPool[]}
   */
  strengths;

  /**
   * The name of the talent used
   *
   * @type {str | undefined}
   */
  talent;

  /**
   * The name of the strength which dominates the roll
   *
   * @type {str}
   */
  dominating_strength;

  /**
   * The feature of the dominating strength which caused it to win
   *
   * Always a string, but the charcter may be numeric or the name of the dominating pool.
   *
   * @type {str}
   */
  dominating_feature;

  constructor({strengths, talent}) {
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
      const max_dice = Math.max(...tied.map(pool => pool.spread[feature]))
      tied.sweep(pool => pool.spread[feature] < max_dice)
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
    const strength_order = strengthPrecedence.slice(0, 3).filter(name => this.strengths.has(name))
    const content = strength_order.map(strength_name => `\t${this.explainStrength(strength_name)}`).join("\n")
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
        .reduce(
          (acc, pool) => acc + pool.successes,
          0,
        )
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
   * The words which describe the final result
   *
   * Compares the player total against the pain total. Main word is "success" or "failure", with an extra
   * descriptor for success.
   *
   * @return {str} String describing the roll result
   */
  get resultWord() {
    if (this.playerTotal >= this.painTotal) {
      const degree = Math.min(4, this.playerTotal - this.painTotal)
      return `${successDegrees[degree]} success`
    }
    return "failure"
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
    content += strength.dice.map(die => die < 4 ? bold(die) : `${die}`).join(", ")
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
}
