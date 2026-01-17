import { roll } from "../../services/base-roller.js"

/**
 * Class to represent a single D&D 3.5 attack roll
 */
export class DndAttack {
  /**
   * Total modifier for the attack
   *
   * @type {number}
   */
  modifier

  /**
   * Minimum number that can be a crit
   *
   * @type {number | NaN}
   */
  crit

  /**
   * The die result rolled to hit
   *
   * Does not include `this.modifier`.
   *
   * @type {number}
   */
  hit

  /**
   * The die result rolled to confirm a crit, if applicable
   *
   * Does not include `this.modifier`.
   *
   * @type {number}
   */
  _confirm

  /**
   * Create a new DndAttack object
   * @param  {number} modifier Total modifier for the attack
   * @param  {number | NaN} crit     Minimum number that can be a crit
   * @return {DndAttack}       New DndAttack object
   */
  constructor(modifier, crit) {
    this.modifier = modifier
    this.crit = crit
    this.hit = roll(1, 20)[0][0]
  }

  /**
   * Total value to compare against ac for a hit
   *
   * Includes `this.modifier`.
   *
   * @type {number}
   */
  get hit_total() {
    return this.hit + this.modifier
  }

  /**
   * The die result rolled to confirm a crit, if applicable
   *
   * If the hit roll is a crit threat, this will be a positive integer. Otherwise, it is zero.
   *
   * @type {number}
   */
  get confirm() {
    if (this._confirm === undefined) this._confirm = this.hit >= this.crit ? roll(1, 20)[0][0] : 0

    return this._confirm
  }

  /**
   * Set the value of our crit confirmation roll
   *
   * @param  {number} die New value for our confirm roll
   */
  set confirm(die) {
    this._confirm = die
  }

  /**
   * Total value to compare against ac for confirming a crit
   *
   * Includes `this.modifier`.
   *
   * @type {number}
   */
  get confirm_total() {
    return this.confirm ? this.confirm + this.modifier : 0
  }
}
