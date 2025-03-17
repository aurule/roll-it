const { i18n } = require("../../locales")
const { operator } = require("../../util/formatters/signed")

const BONUS_ORDER = ["base", "intrinsic", "conditional", "avoid"]
const DEFAULT_CRIT = 10
const DEFAULT_BOTCH = 95

/**
 * Class to more conveniently handle the complex presentation logic for a /ffrpg roll
 *
 * The presenter is designed to handle a single roll or set of identical rolls. It must not be reused for
 * different inputs.
 */
class FfrpgPresenter {
  raw
  base
  intrinsic
  conditional
  avoid
  crit
  botch
  flat
  rolls
  description
  locale
  cos
  t

  constructor({
    raw,
    base,
    intrinsic = 0,
    conditional = 0,
    avoid = 0,
    crit = 10,
    botch = 95,
    flat = false,
    rolls,
    description,
    locale = "en-US",
  } = {}) {
    this.raw = raw,
    this.base = base,
    this.intrinsic = intrinsic,
    this.conditional = conditional,
    this.avoid = avoid,
    this.crit = crit,
    this.botch = botch,
    this.flat = flat,
    this.rolls = rolls,
    this.description = description,
    this.locale = locale,

    this.cos = base + intrinsic + conditional - avoid
    this.t = i18n.getFixedT(locale, "commands", "ffrpg")
  }

  /**
   * Get the string form of this object's results
   *
   * @return {str} All roll results
   */
  presentResults() {
    const t_args = {
      description: this.description,
      context: this.description ? "description" : undefined,
      count: this.rolls,
    }

    if (this.rolls === 1) {
      t_args.result = this.rollResult(0)
      t_args.die = this.raw[0][0]
      t_args.margin = this.rollMargin(0)
      t_args.detail = this.rollDetail(0)
      t_args.cos = this.cos
    } else {
      t_args.results = this.raw
        .map((roll, roll_idx) => {
          const res_args = {
            result: this.rollResult(roll_idx),
            die: roll[0],
            margin: this.rollMargin(roll_idx),
            detail: this.rollDetail(roll_idx),
            cos: this.cos,
          }
          return this.t("response.result", res_args)
        })
        .join("\n")
    }

    return this.t(`response.message`, t_args)
  }

  /**
   * Categorize the result of a roll
   *
   * @param  {int} idx Index of the roll to categorize
   * @return {str}     Description of the roll's outcome
   */
  rollResult(idx) {
    const die = this.raw[idx][0]

    if (this.cos < 10 && die > this.cos && die <= 10) return this.t("result.rule10")
    if (die <= this.cos) {
      if (die <= this.crit) return this.t("result.crit")
      return this.t("result.simple")
    }
    if (this.botch && die >= this.botch) return this.t("result.botch")
    return this.t("result.fail")
  }

  /**
   * Construct a roll's detail breakdown
   *
   * @param  {int} idx Index of the roll to show
   * @return {str}     Description of the roll's components and conditions
   */
  rollDetail(idx) {
    if (this.flat) {
      return this.t("response.detail.shape", {
        context: "flat",
        base: this.base,
      })
    }

    const mods = BONUS_ORDER
      .filter((bonus_name) => this[bonus_name] !== 0)
      .map((bonus_name, bonus_idx) => {
        const value = this[bonus_name]
        const t_name = this.t(`response.detail.parts.${bonus_name}`)
        if (bonus_idx === 0) return `${value} ${t_name}`
        return `${operator(value)} ${t_name}`
      })
      .join("")

    const thresholds = []
    const die = this.raw[idx][0]
    if (this.cos <= 0 || (this.cos <= 10 && die > this.cos && die <= 10)) {
      thresholds.push(this.t("response.detail.rule10"))
    }
    if (!this.botch) thresholds.push(this.t("response.detail.no-botch"))
    if (this.botch && this.botch !== DEFAULT_BOTCH) thresholds.push(this.t("response.detail.botch", { botch: this.botch }))
    if (!this.crit) thresholds.push(this.t("response.detail.no-crit"))
    if (this.crit && this.crit !== DEFAULT_CRIT) thresholds.push(this.t("response.detail.crit", { crit: this.crit }))

    return this.t("response.detail.shape", {
      context: thresholds.length ? "fancy" : undefined,
      mods,
      thresholds: thresholds.join(", ")
    })
  }

  /**
   * Get the margin of success (or failure)
   *
   * @param  {int} idx Index of the roll to compare
   * @return {int}     Difference between CoS and the roll's result
   */
  rollMargin(idx) {
    const die = this.raw[idx][0]
    let comparator = this.cos
    if (this.cos <= 0) comparator = 10
    if (this.cos < 10 && die > this.cos && die <= 10) comparator = 10
    return comparator - die
  }
}

module.exports = {
  /**
   * Present one or more results from the ffrpg command
   *
   * This is the main entry point for the nwod presenter. It's best to use this function instead of manually
   * creating and using an FfrpgPresenter object.
   *
   * @param  {...options} options.rollOptions Roll options and results
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new FfrpgPresenter(rollOptions)
    return presenter.presentResults()
  },
  FfrpgPresenter,
}
