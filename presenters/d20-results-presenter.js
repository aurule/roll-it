const { bold, strikethrough, userMention } = require("discord.js")

/**
 * Create a string describing the results of a rock-paper-scissors roll
 *
 * @param  {Int}       options.modifier     Number to add to the roll's summed result
 * @param  {String}    options.description  Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
 * @param  {obj}       options.picked       Object of results and indexes after picking highest or lowest
 * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
 * @return {String}                         String describing this roll
 */
function presentOne({ modifier, description, raw, picked, userFlake }) {
  let content = [userMention(userFlake), "rolled", detail(raw[0], picked[0].indexes, modifier)]
  // with dis/advantage
  if (description) content.push(`for "${description}"`)
  return content.join(" ")
}

/**
 * Create a string describing the results of many rock-paper-scissors rolls
 *
 * @param  {Int}       options.modifier     Number to add to the roll's summed result
 * @param  {String}    options.description  Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
 * @param  {obj[]}     options.picked       Array of objects of results and indexes after picking highest or lowest
 * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
 * @return {String}                         String describing this roll
 */
function presentMany({ modifier, description, raw, picked, userFlake }) {
  let content = [userMention(userFlake), "rolled"]
  if (description) {
    content.push(`"${description}"`)
  }
  // with dis/advantage
  content.push(raw.length)
  content.push("times:")
  return content
    .concat(raw.map((result, idx) => `\n\t${detail(result, picked[idx].indexes, modifier)}`))
    .join(" ")
}

/**
 * Describe a single roll result
 *
 * @param  {Int[]} result   Array of raw die numbers
 * @param  {int[]} indexes  Array of indexes kept after rolling
 * @param  {Int} modifier Number to add to the raw die
 * @return {string}       Description of the result and modifier
 */
function detail(result, indexes, modifier) {
  const die = result[indexes[0]]
  const content = [bold(die + modifier)]

  let selection = `${die}`
  if (result.length > 1) {
    const nums = result
      .map((res, idx) => {
        if (indexes.includes(idx)) {
          return `${res}`
        } else {
          return strikethrough(res)
        }
      })
      .join(", ")
    selection = `[${nums}]`
  }

  let breakdown = ""
  if (modifier) {
    breakdown = `(${selection} + ${modifier})`
    content.push(breakdown)
  } else if (result.length > 1) {
    content.push(selection)
  }
  return content.join(" ")
}

module.exports = {
  /**
   * Present one or more results from a singleton roll command
   *
   * This is meant to present the output for commands like d20 and d100, where there is only ever a single die
   * result.
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
