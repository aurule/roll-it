const { bold } = require("discord.js")
const { signed } = require("../../util/formatters")
const { i18n } = require("../../locales")

module.exports = {
  /**
   * Present one or more results from the roll command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ rolls, locale, ...rollOptions }) => {
    const t = i18n.getFixedT(locale, "commands", "roll")
    const presenter_options = {
      t,
      ...rollOptions
    }

    if (rolls == 1) {
      return module.exports.presentOne(presenter_options)
    }
    return module.exports.presentMany(presenter_options)
  },

  /**
   * Describe the results of a single roll
   *
   * @param  {Int}    options.pool            Number of dice rolled
   * @param  {Int}    options.sides           Max value of each die
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.modifier        Number to add to the roll's summed result
   * @return {String}                         String describing the roll results
   */
  presentOne: ({ pool, sides, description, raw, summed, modifier = 0, t } = {}) => {
    const t_args = {
      result: summed[0] + modifier,
      description,
      detail: module.exports.detail({ pool, sides, raw: raw[0], modifier }),
      count: 1,
    }

    const key_parts = ["response"]
    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    return t(key, t_args)
  },

  /**
   * Describe the results of multiple rolls
   *
   * @param  {Int}    options.pool            Number of dice rolled
   * @param  {Int}    options.sides           Max value of each die
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.modifier        Number to add to the roll's summed result
   * @return {String}                         String describing the roll results
   */
  presentMany: ({ pool, sides, description, raw, summed, modifier = 0, t } = {}) => {
    const t_args = {
      count: raw.length,
      description,
      results: raw.map((result, index) => {
        return "\t" + t("response.result", { total: summed[index] + modifier, detail: module.exports.detail({ pool, sides, raw: result, modifier }) })
      }).join("\n"),
    }

    const key_parts = ["response"]
    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    return t(key, t_args)
  },

  /**
   * Describe a single roll's details
   *
   * @param  {Int}    options.pool     Number of dice rolled
   * @param  {Int}    options.sides    Max value of each die
   * @param  {Array<Int>} options.raw  Array with ints representing raw dice rolls
   * @param  {Int}    options.modifier Number to add to the roll's summed result
   * @return {String}                  String detailing a single roll
   */
  detail: ({ pool, sides, raw, modifier }) => {
    let detail = [`${pool}d${sides}: [${raw}]`]
    if (modifier) {
      detail.push(signed(modifier))
    }

    return detail.join("")
  },
}
