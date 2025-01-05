const { strikethrough } = require("discord.js")
const { signed } = require("../util/formatters")
const { i18n } = require("../locales")

/**
 * Create a string describing the results of a d20 roll
 *
 * @param  {Int}          modifier    Number to add to the roll's summed result
 * @param  {String}       description Text describing the roll
 * @param  {Array<int[]>} raw         An array of one array with one or two numeric values for the dice
 * @param  {obj}          picked      Object of results and indexes after picking highest or lowest
 * @param  {str}          keep        The method used to pick dice to keep. One of "all", "highest", or "lowest".
 * @param  {i18n.t}       t           Translation function
 * @return {String}                   String describing this roll
 */
function presentOne({ modifier, description, raw, picked, keep, t }) {
  const t_args = {
    result: rollResult(raw[0], picked[0].indexes, modifier),
    description,
    explanation: detail(raw[0], picked[0].indexes, modifier),
    count: 1,
  }

  let key_parts = ["response"]
  if (description) {
    key_parts.push("withDescription")
  } else {
    key_parts.push("withoutDescription")
  }

  switch (keep) {
    case "all":
      if (modifier === 0) {
        key_parts.push("nomod")
        t_args.count = undefined
      } else {
        key_parts.push("simple")
      }
      break
    case "highest":
      key_parts.push("advantage")
      break
    case "lowest":
      key_parts.push("disadvantage")
      break
  }

  const key = key_parts.join(".")
  return(t(key, t_args))
}

/**
 * Create a string describing the results of many d20 rolls
 *
 * @param  {Int}       options.modifier     Number to add to the roll's summed result
 * @param  {String}    options.description  Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  An array of multiple arrays with one or two numeric values for the dice
 * @param  {obj[]}     options.picked       Array of objects of results and indexes after picking highest or lowest
 * @param  {str}       options.keep         The method used to pick dice to keep. One of "all", "highest", or "lowest".
 * @param  {i18n.t}    options.t            Translation function
 * @return {String}                         String describing this roll
 */
function presentMany({ modifier, description, raw, picked, keep, t }) {
  let result_key
  if (modifier === 0 && keep === "all") {
    result_key = "response.result.simple"
  } else {
    result_key = "response.result.explain"
  }

  const results = raw.map((res, idx) => {
    const result = rollResult(res, picked[idx].indexes, modifier)
    const explanation = detail(res, picked[idx].indexes, modifier)
    return "\t" + t(result_key, { result, explanation })
  })

  const t_args = {
    description,
    rolls: raw.length,
    count: raw.length,
    results: results.join("\n"),
  }

  const key_parts = ["response"]

  if (description) {
    key_parts.push("withDescription")
  } else {
    key_parts.push("withoutDescription")
  }

  switch (keep) {
    case "all":
      key_parts.push("simple")
      break
    case "highest":
      key_parts.push("advantage")
      break
    case "lowest":
      key_parts.push("disadvantage")
      break
  }

  const key = key_parts.join(".")
  return t(key, t_args)
}

/**
 * Get the result of a single roll
 * @param  {int[]}  result   Array of die results
 * @param  {int[]}  indexes  Array of a single number containing the index of the die to keep
 * @param  {Number} modifier Number to add to the roll
 * @return {Number}          Final die result
 */
function rollResult(result, indexes, modifier = 0) {
  const die = result[indexes[0]]
  return die + modifier
}

/**
 * Describe a single roll result
 *
 * @param  {Int[]} result    Array of raw die numbers
 * @param  {int[]} indexes   Array of indexes kept after rolling
 * @param  {Int}   modifier  Number to add to the raw die
 * @return {string}          Description of the result and modifier
 */
function detail(result, indexes, modifier = 0) {
  const die = result[indexes[0]]

  const nums = result
    .map((res, idx) => {
      if (indexes.includes(idx)) {
        return `${res}`
      } else {
        return strikethrough(res)
      }
    })
    .join(", ")
  const selection = `[${nums}]`

  if (modifier) {
    return `${selection}${signed(modifier)}`
  }

  return selection
}

module.exports = {
  /**
   * Present one or more results from the d20 command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @param  {str}        options.locale      Locale name
   * @return {String}                         String describing the roll results
   */
  present: ({ rolls, locale, ...rollOptions }) => {
    const t = i18n.getFixedT(locale, "commands", "d20")
    const presenter_options = {
      t,
      ...rollOptions
    }

    if (rolls == 1) {
      return presentOne(presenter_options)
    }
    return presentMany(presenter_options)
  },
  presentOne,
  presentMany,
  detail,
  rollResult,
}
