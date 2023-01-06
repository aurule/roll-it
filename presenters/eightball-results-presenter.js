const { italic, bold, userMention } = require("@discordjs/builders")

const faces = [null, "heads", "tails"]

module.exports = {
  /**
   * Create a string describing the results of a coin flip
   *
   * @param  {String}   options.question      Question the roll is for
   * @param  {bool}     options.doit          Whether to always reply "Do it"
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
   * @return {String}                         String describing this roll
   */
  present: ({ question, doit, raw, userFlake }) => {
    const num = raw[0][0]
    let result = faces[num]
    if (doit) result = italic("Do it")

    let content = [userMention(userFlake), `asked "${question}": `, bold(faces[num])]
    if (description) content.push(`"${description}"`)
    return content.join(" ")
  },
}
