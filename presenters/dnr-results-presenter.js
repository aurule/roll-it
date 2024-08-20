const { bold, underline, italic, strikethrough, Collection } = require("discord.js")

const talentNames = new Collection([
  ["minor", "Minor Exhaustion"],
  ["major", "Major Exhaustion"],
  ["madness", "Madness"],
])

class DnrPresenter {
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

  presentResults() {
    let content = "{{userMention}} rolled"

    switch(this.mode) {
      case "many":
        content += this.presentedDescription()
        content += ` ${this.rolls} times`
        content += this.presentedTalent()
        // foreach this.rolls, make a roll presenter and format
        // **result** dominated by **dominating**
        //     pool1 detail
        //     pool2 detail
        //     n v m pain detail
        break
      case "one":
        // make a roll presenter
        // success/fail
        content += this.presentedDescription()
        // dominant
        content += this.presentedTalent()
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

class DnrRollPresenter {
  constructor({strengths, talent}) {
    this.strengths = strengths
    this.talent = talent
    this.setDominating()
  }

  setDominating() {
    //
    this.dominating_strength = "" // name of the strength which dominates
    this.dominating_feature = "" // name or die value that caused it to dominate
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
    const strength_order = ["discipline", "madness", "exhaustion"].filter(name => this.strengths.has(name))
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
          (acc, pool) => acc + pool.summed[0],
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
    return this.strengths.get("exhaustion")?.pool ?? 0
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
    return this.strengths.get("pain").summed[0]
  }

  /**
   * The word which describes the final result
   *
   * Compares the player total against the pain total.
   *
   * @return {str} Either "success" or "failure"
   */
  get resultWord() {
    if (this.playerTotal > this.painTotal) return "success"
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

    let content = `${strength.summed[0]} ${strength_name} (`
    content += strength.raw[0].map(die => die < 4 ? bold(die) : `${die}`).join(", ")
    content += ")"

    if (this.dominating_strength != strength_name) return content

    return content.replace(this.dominating_feature, underline(this.dominating_feature))
  }
}

module.exports = {
  /**
   * Present one or more results from the dnr command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new DnrPresenter(rollOptions)
    return presenter.presentResults()
  },
  DnrPresenter,
  DnrRollPresenter,
}
