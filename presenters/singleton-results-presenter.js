const { bold } = require("discord.js")
const { added } = require("./addition-presenter")

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
      return module.exports.presentOne(rollOptions)
    }
    return module.exports.presentMany(rollOptions)
  },

  /**
   * Create a string describing the results of a rock-paper-scissors roll
   *
   * @param  {Int}      options.modifier      Number to add to the roll's summed result
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @return {String}                         String describing this roll
   */
  presentOne: ({ modifier, description, raw }) => {
    let content = "{{userMention}} rolled " + module.exports.detail(raw[0][0], modifier)
    if (description) content += ` for "${description}"`
    return content
  },

  /**
   * Create a string describing the results of many rock-paper-scissors rolls
   *
   * @param  {Int}      options.modifier      Number to add to the roll's summed result
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @return {String}                         String describing this roll
   */
  presentMany: ({ modifier, description, raw }) => {
    let content = "{{userMention}} rolled"
    if (description) {
      content += ` "${description}"`
    }
    content += ` ${raw.length} times:`
    content += raw.map((result) => `\n\t${module.exports.detail(result[0], modifier)}`)
    return content
  },

  /**
   * Describe a single roll result
   *
   * @param  {Int} result   Raw die number
   * @param  {Int} modifier Number to add to the raw die
   * @return {string}       Description of the result and modifier
   */
  detail: (result, modifier = 0) => {
    const content = [bold(result + modifier)]
    if (modifier) {
      content.push(`(${result}${added(modifier)})`)
    }
    return content.join(" ")
  },
}
