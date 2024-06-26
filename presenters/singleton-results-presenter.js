const { bold, userMention } = require("discord.js")

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
   * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
   * @return {String}                         String describing this roll
   */
  presentOne: ({ modifier, description, raw, userFlake }) => {
    let content = [userMention(userFlake), "rolled", module.exports.detail(raw[0][0], modifier)]
    if (description) content.push(`for "${description}"`)
    return content.join(" ")
  },

  /**
   * Create a string describing the results of many rock-paper-scissors rolls
   *
   * @param  {Int}      options.modifier      Number to add to the roll's summed result
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
   * @return {String}                         String describing this roll
   */
  presentMany: ({ modifier, description, raw, userFlake }) => {
    let content = [userMention(userFlake), "rolled"]
    if (description) {
      content.push(`"${description}"`)
    }
    content.push(raw.length)
    content.push("times:")
    return content
      .concat(raw.map((result) => `\n\t${module.exports.detail(result[0], modifier)}`))
      .join(" ")
  },

  /**
   * Describe a single roll result
   *
   * @param  {Int} result   Raw die number
   * @param  {Int} modifier Number to add to the raw die
   * @return {string}       Description of the result and modifier
   */
  detail: (result, modifier) => {
    const content = [bold(result + modifier)]
    if (modifier) {
      content.push(`(${result} + ${modifier})`)
    }
    return content.join(" ")
  },
}
