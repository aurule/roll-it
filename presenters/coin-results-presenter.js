const { userMention, bold } = require("discord.js")

const faces = [null, "heads", "tails"]

module.exports = {
  /**
   * Create a string describing the results of a coin flip
   *
   * @param  {String}   options.call          The side the user chose before rolling
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
   * @return {String}                         String describing this roll
   */
  present: ({ call, description, raw, userFlake }) => {
    const num = raw[0][0]

    let content = userMention(userFlake)
    if (call) {
      content += ` called ${call} and`
    }
    content += ` flipped a coin`
    if (description) {
      content += ` for "${description}"`
    }
    content += `. They got ${bold(faces[num])}.`

    return content
  },
}
