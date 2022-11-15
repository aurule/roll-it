const { userMention } = require("@discordjs/builders")

const faces = [null, "heads", "tails"]

module.exports = {
  /**
   * Create a string describing the results of a coin flip
   *
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @param  {Snowflake} options.userFlake    Snowflake ID of the user who made the roll
   * @return {String}                         String describing this roll
   */
  present: ({ description, raw, userFlake }) => {
    const num = raw[0][0]

    let content = [userMention(userFlake), "flipped a coin and got", faces[num]]
    if (description) content.push(`"${description}"`)
    return content.join(" ")
  },
}
