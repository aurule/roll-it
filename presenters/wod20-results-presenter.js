const { bold, strikethrough, userMention } = require("@discordjs/builders")

module.exports = {
  /**
   * Present one or more results from the roll command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ rolls, ...rollOptions }) => {
    if (rollOptions.until) {
      return module.exports.presentUntil(rollOptions)
    }
    if (rolls == 1) {
      return module.exports.presentOne(rollOptions)
    }
    return module.exports.presentMany(rollOptions)
  },

  /**
   * Format a roll result
   *
   * @param  {Int} successes Total successes
   * @return {String}        The number or "botch"
   */
  formatSuccesses(successes) {
    if (successes < 0) return "botch"
    return successes.toString()
  },

  /**
   * Describe the results of a single roll
   *
   * @param  {Int}    options.pool            Number of dice rolled
   * @param  {Int}    options.difficulty      Threshold for success
   * @param  {Bool}   options.specialty       Whether 10s count as two successes
   * @param  {Int}    options.until           Target number of successes from multiple rolls
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Snowflake} options.userFlake    Snowflake of the user that made the roll
   * @return {String}                         String describing the roll results
   */
  presentOne: ({
    pool,
    difficulty,
    specialty,
    until,
    description,
    raw,
    summed,
    userFlake,
  }) => {
    let content = [
      userMention(userFlake),
      "rolled",
      bold(module.exports.formatSuccesses(summed[0])),
    ]
    if (description) {
      content.push(`"${description}"`)
    }
    content.push(
      module.exports.detailOne({ pool, difficulty, specialty, raw: raw[0] })
    )
    return content.join(" ")
  },

  /**
   * Describe a single roll's details
   *
   * @param  {Int}    options.pool       Number of dice rolled
   * @param  {Int}    options.difficulty Threshold for success
   * @param  {Bool}   options.specialty  Whether 10s count as two successes
   * @param  {Array<Int>} options.raw    Array with ints representing raw dice rolls
   * @return {String}                    String detailing a single roll
   */
  detailOne: ({ pool, difficulty, specialty, raw }) => {
    let detail = [`(${pool} diff ${difficulty}`]
    if (specialty) {
      detail.push(` specialty`)
    }
    detail.push(": [")

    detail = detail.concat(
      raw
        .map((die) => {
          if (die == 1) return strikethrough(die)
          if (specialty && die == 10) return bold(`${die}!`)
          if (die >= difficulty) return bold(die)
          return die
        })
        .join(", ")
    )

    detail.push("])")

    return detail.join("")
  },

  /**
   * Describe the results of multiple rolls
   *
   * @param  {Int}    options.pool            Number of dice rolled
   * @param  {Int}    options.difficulty      Threshold for success
   * @param  {Bool}   options.specialty       Whether 10s count as two successes
   * @param  {Int}    options.until           Target number of successes from multiple rolls
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.userFlake       Snowflake of the user that made the roll
   * @return {String}                         String describing the roll results
   */
  presentMany: ({
    pool,
    difficulty,
    specialty,
    until,
    description,
    raw,
    summed,
    userFlake,
  }) => {
    const specialNote = specialty ? "with specialty" : ""
    const descNote = description ? ` "${description}"` : ""
    let content = [userMention(userFlake), " rolled"]
    content.push(descNote)
    content.push(` ${raw.length} times`)
    content.push(` at ${pool} diff ${difficulty}${specialNote}`)
    content.push(":")
    return content
      .concat(
        raw.map((result, index) => {
          return [
            `\n\t${bold(module.exports.formatSuccesses(summed[index]))} `,
            module.exports.detailMany({
              pool,
              difficulty,
              specialty,
              raw: result,
            }),
          ].join(" ")
        })
      )
      .join("")
  },

  /**
   * Describe a single roll's details
   *
   * @param  {Int}    options.pool       Number of dice rolled
   * @param  {Int}    options.difficulty Threshold for success
   * @param  {Bool}   options.specialty  Whether 10s count as two successes
   * @param  {Array<Int>} options.raw    Array with ints representing raw dice rolls
   * @return {String}                    String detailing a single roll
   */
  detailMany: ({ pool, difficulty, specialty, raw }) => {
    let detail = [`(`]
    detail = detail.concat(
      raw
        .map((die) => {
          if (die == 1) return strikethrough(die)
          if (specialty && die == 10) return bold(`${die}!`)
          if (die >= difficulty) return bold(die)
          return die
        })
        .join(", ")
    )
    detail.push(")")

    return detail.join("")
  },

  /**
   * Describe the results of multiple rolls
   *
   * @param  {Int}    options.pool            Number of dice rolled
   * @param  {Int}    options.difficulty      Threshold for success
   * @param  {Bool}   options.specialty       Whether 10s count as two successes
   * @param  {Int}    options.until           Target number of successes from multiple rolls
   * @param  {String} options.description     Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
   * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
   * @param  {Int}    options.userFlake       Snowflake of the user that made the roll
   * @return {String}                         String describing the roll results
   */
  presentUntil: ({
    pool,
    difficulty,
    specialty,
    until,
    description,
    raw,
    summed,
    userFlake,
  }) => {
    const specialNote = specialty ? "with specialty" : ""
    const descNote = description ? ` "${description}"` : ""
    const finalSum = summed.reduce((prev, curr) => prev + curr, 0)

    let content = [userMention(userFlake), " rolled"]
    content.push(descNote)
    content.push(` until ${until} successes`)
    content.push(` at ${pool} diff ${difficulty}${specialNote}`)
    content.push(":")
    content = content.concat(
      raw.map((result, index) => {
        return [
          `\n\t${bold(module.exports.formatSuccesses(summed[index]))} `,
          module.exports.detailMany({
            pool,
            difficulty,
            specialty,
            raw: result,
          }),
        ].join(" ")
      })
    )
    content.push(`\n${bold(finalSum)} of ${until}`)
    content.push(` in ${raw.length} rolls`)

    return content.join("")
  },
}
