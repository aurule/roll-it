const { userMention } = require("discord.js")

const emoji = [
  null,
  "<:fateneg:1038147643836203018>",
  "<:fatezero:1038147645874647111>",
  "<:fatepos:1038147644767350827>",
]
const ladder = [
  "an Impossible",
  "a Catastrophic",
  "an Awful",
  "a Terrible",
  "a Poor",
  "a Mediocre",
  "an Average",
  "a Fair",
  "a Good",
  "a Great",
  "a Superb",
  "a Fantastic",
  "an Epic",
  "a Legendary",
]

module.exports = {
  /**
   * Present one or more results from the fate command
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
   * Describe the results of a single fate roll
   *
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.modifier        Number to add to the roll's summed result
   * @param  {Snowflake} options.userFlake    Snowflake of the user that made the roll
   * @return {String}                         String describing the roll results
   */
  presentOne: ({ description, raw, summed, modifier, userFlake }) => {
    let content = [userMention(userFlake), "rolled"]
    content.push(module.exports.toLadder(summed[0] + modifier))
    if (description) {
      content.push("for")
      content.push(`"${description}"`)
    }
    content.push(":")
    content.push(module.exports.detail({ raw: raw[0], modifier }))
    return content.join(" ")
  },

  /**
   * Describe the results of multiple fate rolls
   *
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.modifier        Number to add to the roll's summed result
   * @param  {Int}    options.userFlake       Snowflake of the user that made the roll
   * @return {String}                         String describing the roll results
   */
  presentMany: ({ description, raw, summed, modifier, userFlake }) => {
    let content = [userMention(userFlake), "rolled"]
    if (description) {
      content.push(`"${description}"`)
    }
    content.push(raw.length)
    content.push("times:")
    return content
      .concat(
        raw.map((result, index) => {
          return [
            `\n\t${module.exports.toLadder(summed[index] + modifier)}`,
            "result:",
            module.exports.detail({ raw: result, modifier }),
          ].join(" ")
        })
      )
      .join(" ")
  },

  /**
   * Show a fate result on the ladder with signed number
   *
   * @param  {Int}    num Roll result
   * @return {String}     String with the ladder name and signed result
   */
  toLadder: (num) => {
    const index = num + 5

    let content = ["**", ladder[index], " ("]
    if (num > 0) content.push("+")
    content.push(num)
    content.push(")**")

    return content.join("")
  },

  /**
   * Describe a single roll's details
   *
   * @param  {Array<Int>} options.raw  Array with ints representing raw dice rolls
   * @param  {Int}    options.modifier Number to add to the roll's summed result
   * @return {String}                  String detailing a single roll
   */
  detail: ({ raw, modifier }) => {
    let detail = raw.map((face) => {
      return emoji[face]
    })

    if (modifier) {
      detail.push(` + ${modifier}`)
    }

    return detail.join("")
  },
}
