const { bold, userMention } = require("@discordjs/builders")

const emoji = [
  null,
  "<:fateneg:1038147643836203018>",
  "<:fatezero:1038147645874647111>",
  "<:fatepos:1038147644767350827>",
]
const ladder = [
  "Impossible",
  "Catastrophic",
  "Awful",
  "Terrible",
  "Poor",
  "Mediocre",
  "Average",
  "Fair",
  "Good",
  "Great",
  "Superb",
  "Fantastic",
  "Epic",
  "Legendary",
]

module.exports = {
  /**
   * Present one or more results from the fate command
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
   * Examples:
   * <user mention> rolled a **Great (+4)** result "craft knife" (-+00 + 4)
   *
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.modifier        Number to add to the roll's summed result
   * @param  {Snowflake} options.userFlake    Snowflake of the user that made the roll
   * @return {String}                         String describing the roll results
   */
  presentOne: ({ description, raw, summed, modifier, userFlake }) => {
    let content = [
      userMention(userFlake),
      "rolled a",
      module.exports.toLadder(summed[0] + modifier),
      "result",
    ]
    if (description) {
      content.push(`"${description}"`)
    }
    content.push(module.exports.detail({ raw: raw[0], modifier }))
    return content.join(" ")
  },

  /**
   * Describe the results of multiple fate rolls
   *
   * Example:
   *    <user mention> rolled "baddie stabbin" 3 times:
   *      **Mediocre (+0)** (-+00 + 4)
   *      **Fair (+2)** (-+++ + 4)
   *      **Epic (+7)** (+0++ + 4)
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
            module.exports.detail({ raw: result, modifier }),
          ].join(" ")
        })
      )
      .join(" ")
  },

  /**
   * Show a fate result on the ladder with signed number
   *
   * Example: Great (+4)
   *
   * @param  {Int}    num Roll result
   * @return {String}     String with the ladder name and signed result
   */
  toLadder: (num) => {
    const index = num + 5

    let content = [ladder[index], " ("]
    if (num > 0) content.push("+")
    content.push(num)
    content.push(")")

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
    let detail = ["("].concat(
      raw.map((face) => {
        return emoji[face]
      })
    )

    if (modifier) {
      detail.push(` + ${modifier}`)
    }
    detail.push(")")

    return detail.join("")
  },
}
