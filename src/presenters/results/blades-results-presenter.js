import { i18n } from "../../locales/index.js"
import { keepFromArray } from "../../services/pick.js"

export class BladesPresenter {
  constructor({ rolls, chance, raw, pool, description, locale = "en-US" } = {}) {
    this.rolls = rolls
    this.chance = chance
    this.raw = raw
    this.pool = pool
    this.description = description
    this.locale = locale

    this.t = i18n.getFixedT(this.locale, "commands", "blades")
  }

  /**
   * Create a string for the entire set of rolls
   * @return {string} Full text of the rolls' results
   */
  presentResults() {
    const key = this.description ? "withDescription" : "withoutDescription"
    const t_args = {
      count: this.rolls,
      description: this.description,
      described_pool: this.describePool(),
    }
    if (this.rolls == 1) {
      t_args.result = this.getResult(this.raw[0])
      t_args.detail = this.detail(this.raw[0])
    } else {
      t_args.outcomes = this.raw.map((rawDice) => {
        return this.t("response.outcome", {
          result: this.getResult(rawDice),
          described_pool: this.describePool(),
          detail: this.detail(rawDice)
        })
      })
    }

    return this.t(`response.${key}`, t_args)
  }

  /**
   * Describe the dice pool
   * @return {string} Described pool
   */
  describePool() {
    if (this.chance) {
      return this.t("response.pool_chance", { pool: this.pool })
    }
    return `${this.pool}d6`
  }

  /**
   * Get the largest result(s) of a roll
   *
   * In chance mode, this gets the lowest single result.
   *
   * @param  {number[]} dice Array of dice to check
   * @return {object}        Keep results object, with indexes and results
   */
  mostSignificant(dice) {
    if (this.chance) {
      return keepFromArray(dice, 1, "lowest")
    }

    if (this.pool > 1 && dice.includes(6) && (dice.indexOf(6) != dice.lastIndexOf(6))) {
      return keepFromArray(dice, 2, "highest")
    }

    return keepFromArray(dice, 1, "highest")
  }

  /**
   * Create the result for a pool of dice
   * @param  {number[]} dice Dice to judge
   * @return {string}        Result string
   */
  getResult(dice) {
    const kept = this.mostSignificant(dice)

    switch (kept.results[0]) {
      case 6:
        if (kept.indexes.length == 2 && kept.results[1] == 6) return this.t("result.crit")
        return this.t("result.full")
      case 5:
      case 4:
        return this.t("result.part")
      default:
        return this.t("result.bad")
    }
  }

  /**
   * Build the dice result details
   *
   * The highest single die is bolded. If two sixes are present, both are bolded.
   *
   * @param  {number[]} dice Array of dice rolls to process
   * @return {string}        String describing the result
   */
  detail(dice) {
    const kept = this.mostSignificant(dice)

    const out = []
    for (const [idx, die] of dice.entries()) {
      if (kept.indexes.includes(idx)) {
        out.push(`**${die}**`)
      } else {
        out.push(die)
      }
    }
    return out.join(", ")
  }
}

export function present({ ...rollOptions }) {
  const presenter = new BladesPresenter(rollOptions)
  return presenter.presentResults()
}
