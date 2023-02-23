const { inlineCode, userMention } = require("@discordjs/builders")

const emojiFlat = [null, ":rock: rock", ":scroll: paper", ":scissors: scissors"]
const emojiStatic = [
  null,
  inlineCode("pass"),
  inlineCode("tie"),
  inlineCode("fail"),
]
const emojiBomb = [
  null,
  ":rock: rock",
  ":firecracker: bomb",
  ":scissors: scissors",
]
const emojiStaticBomb = [
  null,
  inlineCode("pass"),
  inlineCode("pass"),
  inlineCode("fail"),
]

module.exports = {
  /**
   * Create a string describing the results of a rock-paper-scissors roll
   *
   * @param  {Bool}     options.static_test   Whether the roll should be interpreted as pass-tie-fail
   * @param  {Bool}     options.bomb          Whether paper is replaced with bomb
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
   * @return {String}                         String describing this roll
   */
  present: ({ static_test, bomb, description, raw, userFlake }) => {
    const num = raw[0][0]

    let content = [
      userMention(userFlake),
      "rolled",
      module.exports.rollToEmoji(raw[0][0], static_test, bomb),
    ]
    if (description) content.push(`for "${description}"`)
    return content.join(" ")
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
