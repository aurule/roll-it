const { inlineCode } = require("discord.js")

const { pretty } = require("./met-static-results-presenter")

module.exports = {
  /**
   * Present one or more results from the chop command
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
   * @param  {Bool}     options.thrown      Whether the roll should be interpreted as pass-tie-fail
   * @param  {Bool}     options.bomb          Whether paper is replaced with bomb
   * @param  {String}   options.description Text describing the roll
   * @return {String}                       String describing this roll
   */
  presentOne: ({ thrown, bomb, description }) => {
    let content = [
      "{{userMention}} rolled ",
      pretty(thrown[0]),
    ]
    if (description) content.push(`for "${description}"`)
    return content.join(" ")
  },

  /**
   * Create a string describing the results of many rock-paper-scissors rolls
   *
   * @param  {Bool}     options.thrown RPS results
   * @param  {Bool}     options.bomb          Whether paper is replaced with bomb
   * @param  {String}   options.description   Text describing the roll
   * @return {String}                         String describing this roll
   */
  presentMany: ({ thrown, description, rolls }) => {
    let content = ["{{userMention}} rolled"]
    if (description) {
      content.push(`"${description}"`)
    }
    content.push(raw.length)
    content.push("times:")
    return content
      .concat(raw.map((result) => `\n\t${module.exports.rollToEmoji(result, static_test, bomb)}`))
      .join(" ")
  },

  /**
   * Convert a 1-3 roll into an appropriate emoji or word
   *
   * @param  {Int}  num         A number between 1 and 3
   * @param  {Bool} static_test Whether to use a static test table for the result
   * @param  {Bool} bomb        Whether to use a bomb table for the result
   * @return {String}           String containing an emoji and/or word describing the number
   */
  rollToEmoji: (num, static_test, bomb) => {
    if (static_test && bomb) return emojiStaticBomb[num]
    if (static_test) return emojiStatic[num]
    if (bomb) return emojiBomb[num]
    return emojiFlat[num]
  },
}
