import { strikethrough } from "discord.js"
import { operator } from "../../util/formatters/index.js"
import { i18n } from "../../locales/index.js"

/**
 * Create a string describing the results of a d20 roll
 *
 * @param  {object}     opts
 * @param  {number}     opts.modifier    Number to add to the roll's summed result
 * @param  {string}     opts.description Text describing the roll
 * @param  {number[][]} opts.raw         An array of one array with one or two numeric values for the dice
 * @param  {object}     opts.picked      Object of results and indexes after picking highest or lowest
 * @param  {string}     opts.keep        The method used to pick dice to keep. One of "all", "highest", or "lowest".
 * @param  {i18n.t}     opts.t           Translation function
 * @return {string}                      String describing this roll
 */
export function presentOne({ modifier, description, raw, picked, keep, t }) {
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
 * Create a string describing the results of many d20 rolls
 *
 * @param  {object}     opts
 * @param  {number}     opts.modifier     Number to add to the roll's summed result
 * @param  {string}     opts.description  Text describing the roll
 * @param  {number[][]} opts.raw          An array of multiple arrays with one or two numeric values for the dice
 * @param  {object[]}   opts.picked       Array of objects of results and indexes after picking highest or lowest
 * @param  {string}     opts.keep         The method used to pick dice to keep. One of "all", "highest", or "lowest".
 * @param  {i18n.t}     opts.t            Translation function
 * @return {string}                       String describing this roll
 */
export function presentMany({ modifier, description, raw, picked, keep, t }) {
  const results = raw.map((res, idx) => {
    const result = rollResult(res, picked[idx].indexes, modifier)
    const explanation = detail(res, picked[idx].indexes, modifier)
    return "\t" + t("response.result", { result, explanation })
  })

  const t_args = {
    description,
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
 * @param  {number[]} result   Array of die results
 * @param  {number[]} indexes  Array of a single number containing the index of the die to keep
 * @param  {number}   modifier Number to add to the roll
 * @return {number}            Final die result
 */
export function rollResult(result, indexes, modifier) {
  const die = result[indexes[0]]
  return die + modifier
}

/**
 * Describe a single roll result
 *
 * @param  {number[]}  result   Array of raw die numbers
 * @param  {number[]}  indexes  Array of indexes kept after rolling
 * @param  {number}    modifier Number to add to the raw die
 * @return {string}             Description of the result and modifier
 */
export function detail(result, indexes, modifier) {
  const nums = result
    .map((res, idx) => {
      if (indexes.includes(idx)) {
        return `${res}`
      } else {
        return strikethrough(res)
      }
    })
    .join(", ")
  const selection = `${result.length}d20: [${nums}]`

  if (modifier) {
    return `${selection}${operator(modifier)}`
  }

  return selection
}


/**
 * Present one or more results from the d20 command
 *
 * @param  {object} options
 * @param  {number} options.rolls       Total number of rolls to show
 * @param  {object} options.rollOptions The rest of the options, passed to presentOne or presentMany
 * @param  {str}    options.locale      Locale name
 * @return {str}                        String describing the roll results
 */
export function present({ rolls, locale, ...rollOptions }) {
  const t = i18n.getFixedT(locale, "commands", "d20")
  const presenter_options = {
    t,
    ...rollOptions,
  }

  if (rolls == 1) {
    return presentOne(presenter_options)
  }
  return presentMany(presenter_options)
}
