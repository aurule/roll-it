const { bold, strikethrough, Collection } = require("discord.js")
const { signed } = require("../../util/formatters")

/**
 * Create a string describing the results of a Stars Without Number roll
 *
 * @param  {Int}          modifier    Number to add to the roll's summed result
 * @param  {String}       description Text describing the roll
 * @param  {Array<int[]>} raw         An array of one array with multiple numeric values for the die
 * @param  {obj}          picked      Object of results and indexes after picking highest or lowest
 * @param  {int[]}        summed      Array of ints, summing the rolled dice
 * @return {String}                   String describing this roll
 */
function presentOne({ modifier, description, raw, picked, summed }) {
  let content = "{{userMention}} rolled " + detail({result: raw[0], indexes: picked[0].indexes, summed: summed[0], modifier})
  if (description) content += ` for "${description}"`
  return content
}

/**
 * Create a string describing the results of many Stars Without Number rolls
 *
 * @param  {Int}       options.modifier     Number to add to the roll's summed result
 * @param  {String}    options.description  Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  An array of multiple arrays with multiple numeric values for the dice
 * @param  {obj[]}     options.picked       Array of objects of results and indexes after picking the highest two
 * @param  {int[]}     options.summed      Array of one int, summing the rolled dice
 * @return {String}                         String describing this roll
 */
function presentMany({ modifier, description, raw, picked, summed}) {
  let content = "{{userMention}} rolled"
  if (description) {
    content += ` "${description}"`
  }
  content += ` ${raw.length} times:`
  content += raw.map((result, idx) => `\n\t${detail({result, indexes: picked[idx].indexes, summed: summed[idx], modifier})}`)
  return content
}

/**
 * Describe a single roll result
 *
 * @param  {Int[]} result   Array of raw die numbers
 * @param  {int[]} indexes  Array of indexes kept after rolling
 * @param  {Int}   modifier Number to add to the raw die
 * @param  {int}   summed   Result dice added together
 * @return {string}         Description of the result and modifier
 */
function detail({result, indexes, summed, modifier = 0}) {
  const content = [bold(summed + modifier)]

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

  if (modifier !== 0) {
    content.push(`(${selection}${signed(modifier)})`)
  } else {
    content.push(selection)
  }
  return content.join(" ")
}

module.exports = {
  /**
   * Present one or more results from the d20 command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ rolls, ...rollOptions }) => {
    if (rolls == 1) {
      return presentOne(rollOptions)
    }
    return presentMany(rollOptions)
  },
  presentOne,
  presentMany,
  detail,
}
