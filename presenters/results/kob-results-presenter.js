const { bold } = require("discord.js")
const { operator } = require("../../util/formatters")
const { i18n } = require("../../locales")

/**
 * Describe the results of a single roll
 *
 * @param  {Int}          options.sides       Max value of each die
 * @param  {String}       options.description Text describing the roll
 * @param  {Array<int[]>} options.raw         Array of one array with ints representing raw dice rolls
 * @param  {int[]}        options.summed      Array of one int, summing the rolled dice
 * @param  {Int}          options.modifier    Number to add to the roll's summed result
 * @param  {i18n.t}       options.t           Translation function
 * @return {String}                           String describing the roll results
 */
function presentOne({ sides, description, raw, summed, modifier = 0, t } = {}) {
  const t_args = {
    count: 1,
    description,
    result: summed[0] + modifier,
    detail: module.exports.detail({ sides, raw: raw[0], modifier }),
  }

  const key_parts = ["response"]

  if (description) {
    key_parts.push("withDescription")
  } else {
    key_parts.push("withoutDescription")
  }

  const key = key_parts.join(".")
  return t(key, t_args)
}

/**
 * Describe the results of multiple rolls
 *
 * @param  {Int}          options.sides       Max value of each die
 * @param  {String}       options.description Text describing the roll
 * @param  {Array<int[]>} options.raw         Array of arrays with ints representing raw dice rolls
 * @param  {int[]}        options.summed      Array of ints, summing the rolled dice
 * @param  {Int}          options.modifier    Number to add to the roll's summed result
 * @param  {i18n.t}       options.t           Translation function
 * @return {String}                           String describing the roll results
 */
function presentMany({ sides, description, raw, summed, modifier = 0, t } = {}) {
  const t_args = {
    count: raw.length,
    description,
    results: raw
      .map(
        (result, idx) =>
          "\t" +
          t("response.result", {
            result: summed[idx] + modifier,
            detail: module.exports.detail({ sides, raw: result, modifier }),
          }),
      )
      .join("\n"),
  }

  const key_parts = ["response"]

  if (description) {
    key_parts.push("withDescription")
  } else {
    key_parts.push("withoutDescription")
  }

  const key = key_parts.join(".")
  return t(key, t_args)
}

/**
 * Describe a single roll's details
 *
 * @param  {Int}    options.sides    Max value of each die
 * @param  {int[]} options.raw  Array with ints representing raw dice rolls
 * @param  {Int}    options.modifier Number to add to the roll's summed result
 * @return {String}                  String detailing a single roll
 */
function detail({ sides, raw, modifier }) {
  let detail = `d${sides}: [`
  detail += raw
    .map((die) => {
      if (die == sides) return bold(die)
      return die.toString()
    })
    .join(", ")
  detail += "]"

  if (modifier) {
    detail += operator(modifier)
  }

  return detail
}

module.exports = {
  /**
   * Present one or more results from the kob command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ rolls, locale, ...rollOptions }) => {
    const presenter_options = {
      ...rollOptions,
      t: i18n.getFixedT(locale, "commands", "kob"),
    }
    if (rolls == 1) {
      return presentOne(presenter_options)
    }
    return presentMany(presenter_options)
  },
  presentOne,
  presentMany,
  detail,
}
