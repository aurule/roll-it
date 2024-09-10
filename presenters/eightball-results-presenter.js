const { italic } = require("discord.js")

const faces = [
  null,
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
]

module.exports = {
  /**
   * Create a string describing the results of a coin flip
   *
   * @param  {String}   options.question      Question the roll is for
   * @param  {bool}     options.doit          Whether to always reply "Do it"
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @return {String}                         String describing this roll
   */
  present: ({ question, doit, raw }) => {
    const num = raw[0][0]
    let result = faces[num]
    if (doit) result = "Do it"

    return `{{userMention}} asked "${question}" :8ball: ${italic(result)}`
  },
}
