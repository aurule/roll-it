const { bold } = require("discord.js")
const { added } = require("./addition-presenter")

/**
 * Describe the results of a single roll
 *
 * @param  {Int}    options.sides           Max value of each die
 * @param  {String} options.description     Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
 * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
 * @param  {Int}    options.modifier        Number to add to the roll's summed result
 * @return {String}                         String describing the roll results
 */
function presentOne({ sides, description, raw, summed, modifier }) {
  modifier = modifier ?? 0
  let content = ["{{userMention}} rolled", bold(summed[0] + modifier)]
  if (description) {
    content.push(`"${description}"`)
  }
  content.push(module.exports.detail({ sides, raw: raw[0], modifier }))
  return content.join(" ")
}

/**
 * Describe the results of multiple rolls
 *
 * @param  {Int}    options.sides           Max value of each die
 * @param  {String} options.description     Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
 * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
 * @param  {Int}    options.modifier        Number to add to the roll's summed result
 * @return {String}                         String describing the roll results
 */
function presentMany({ sides, description, raw, summed, modifier }) {
  modifier = modifier ?? 0
  let content = ["{{userMention}} rolled"]
  if (description) {
    content.push(`"${description}"`)
  }
  content.push(raw.length)
  content.push("times:")
  return content
    .concat(
      raw.map((result, index) => {
        return [
          `\n\t${bold(summed[index] + modifier)}`,
          module.exports.detail({ sides, raw: result, modifier }),
        ].join(" ")
      }),
    )
    .join(" ")
}

/**
 * Describe a single roll's details
 *
 * @param  {Int}    options.sides    Max value of each die
 * @param  {Array<Int>} options.raw  Array with ints representing raw dice rolls
 * @param  {Int}    options.modifier Number to add to the roll's summed result
 * @return {String}                  String detailing a single roll
 */
function detail({ sides, raw, modifier }) {
  let detail = `(d${sides}: [`
  detail += raw
    .map((die) => {
      if (die == sides) return bold(die)
      return die.toString()
    })
    .join(", ")
  detail += "]"

  if (modifier) {
    detail += added(modifier)
  }

  return detail + ")"
}

module.exports = {
  /**
   * Present one or more results from the kob command
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
