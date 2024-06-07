const { bold, userMention } = require("discord.js")


/**
 * Describe the results of a single roll
 *
 * @param  {Int}    options.pool            Number of dice rolled
 * @param  {bool}   options.chance          Whether this is the result of a chance roll
 * @param  {bool}   options.rote            Whether this is the result of a rote roll
 * @param  {Int}    options.threshold       Threshold for success
 * @param  {Bool}   options.explode         Whether 10s were re-rolled
 * @param  {Int}    options.until           Target number of successes from multiple rolls
 * @param  {String} options.description     Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
 * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
 * @param  {Snowflake} options.userFlake    Snowflake of the user that made the roll
 * @return {String}                         String describing the roll results
 */
function presentOne({
  pool,
  chance,
  rote,
  threshold,
  explode,
  until,
  description,
  raw,
  summed,
  userFlake,
}) {
  const content = [
    userMention(userFlake),
    "rolled",
    explainChance(chance, raw[0], summed[0])
  ]
  if (description) {
    content.push(`for "${description}"`)
  }
  content.push(
    detailOne({ pool, rote, threshold, explode, raw: raw[0] })
  )
  return content.join(" ")
}

/**
 * Explain a result
 *
 * If it's a chance roll, then a raw die of 1 is a dramatic failure.
 * Otherwise, return the summed result as usual.
 *
 * @param  {bool}   chance Whether this is the result of a chance roll
 * @param  {int[]}  raw    Array of a single roll's dice results
 * @param  {int}    summed Normal success sum of those dice
 * @return {string}        A string describing the result
 */
function explainChance(chance, raw, summed) {
  if (chance && raw[0] === 1) {
    return `a ${bold("dramatic failure")}`
  }
  return bold(summed)
}

/**
 * Describe a single roll's details
 *
 * @param  {Int}    options.pool       Number of dice rolled
 * @param  {bool}   options.rote       Whether this is the result of a rote roll
 * @param  {Int}    options.threshold  Threshold for success
 * @param  {Bool}   options.explode    Whether 10s were re-rolled
 * @param  {Array<Int>} options.raw    Array with ints representing raw dice rolls
 * @return {String}                    String detailing a single roll
 */
function detailOne ({ pool, rote, threshold, explode, raw }) {
  let detail = [
    `(${pool} dice`,
    explainRote(rote),
    explainThreshold(threshold),
    explainExplode(explode),
  ]
  detail.push(": [")

  detail = detail.concat(
    raw
      .map((die) => {
        if (die >= threshold) {
          if (die >= explode) return bold(`${die}!`)
          return bold(die)
        }
        return die
      })
      .join(", ")
  )

  detail.push("])")

  return detail.join("")
}

/**
 * Get text describing the passed success threshold
 *
 * >=8: empy string
 * other: "succeeding on 9 and up"
 *
 * @param  {Int}    threshold Threshold for tallying a success
 * @return {String}           Brief description of the success threshold
 */
function explainThreshold(threshold) {
  if (threshold == 8) return ""
  const lines = [` succeeding on ${threshold}`]
  if (threshold < 10) lines.push(" and up")
  return lines.join("")
}

/**
 * Get text describing the passed n-again option
 *
 * For 10-again: empty string
 * <10-again: "with 8-again"
 * >10: "with no 10-again"
 *
 * @param  {Int}    explode Number on which dice explode
 * @return {String}         Brief description of the n-again in play
 */
function explainExplode(explode) {
  if (explode == 10) return ""
  if (explode > 10) return " with no 10-again"
  return ` with ${explode}-again`
}

/**
 * Get text describing the passed rote option
 *
 * @param  {bool} rote Whether this was a rote roll
 * @return {str}       Brief description of the rote option
 */
function explainRote(rote) {
  if (rote) return " with rote"
  return ""
}

/**
 * Describe the results of multiple rolls
 *
 * @param  {Int}    options.pool            Number of dice rolled
 * @param  {bool}   options.chance          Whether this is the result of a chance roll
 * @param  {bool}   options.rote            Whether this is the result of a rote roll
 * @param  {Int}    options.threshold       Threshold for success
 * @param  {Bool}   options.explode         Whether 10s were re-rolled
 * @param  {Int}    options.until           Target number of successes from multiple rolls
 * @param  {String} options.description     Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
 * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
 * @param  {Int}    options.userFlake       Snowflake of the user that made the roll
 * @return {String}                         String describing the roll results
 */
function presentMany({
  pool,
  chance,
  rote,
  threshold,
  explode,
  until,
  description,
  raw,
  summed,
  userFlake,
}) {
  const content = [userMention(userFlake), " rolled"]

  if (description) {
    content.push(` "${description}"`)
  }
  content.push(` ${raw.length} times with`)

  content.push(` ${pool} dice`)
  content.push(explainRote(rote))
  content.push(explainThreshold(threshold))
  content.push(explainExplode(explode))
  content.push(":")
  return content
    .concat(
      raw.map((result, index) => {
        return [
          `\n\t${explainChance(chance, raw[index], summed[index])} `,
          detailMany({
            pool,
            threshold,
            explode,
            raw: result,
          }),
        ].join(" ")
      })
    )
    .join("")
}

/**
 * Describe a single roll's details
 *
 * @param  {Int}    options.pool       Number of dice rolled
 * @param  {Int}    options.threshold  Threshold for success
 * @param  {Bool}   options.explode    Whether 10s were re-rolled
 * @param  {Array<Int>} options.raw    Array with ints representing raw dice rolls
 * @return {String}                    String detailing a single roll
 */
function detailMany({ pool, threshold, explode, raw }) {
  let detail = ["("]
  detail = detail.concat(
    raw
      .map((die) => {
        if (die >= threshold) {
          if (die >= explode) return bold(`${die}!`)
          return bold(die)
        }
        return die
      })
      .join(", ")
  )
  detail.push(")")

  return detail.join("")
}

/**
 * Describe the results of multiple rolls
 *
 * @param  {Int}    options.pool            Number of dice rolled
 * @param  {Int}    options.threshold       Threshold for success
 * @param  {Bool}   options.explode         Whether 10s were re-rolled
 * @param  {Int}    options.until           Target number of successes from multiple rolls
 * @param  {String} options.description     Text describing the roll
 * @param  {Array<Array<Int>>} options.raw  Array of one array with ints representing raw dice rolls
 * @param  {Array<Int>} options.summed      Array of one int, summing the rolled dice
 * @param  {Int}    options.userFlake       Snowflake of the user that made the roll
 * @return {String}                         String describing the roll results
 */
function presentUntil({
  pool,
  threshold,
  explode,
  until,
  description,
  raw,
  summed,
  userFlake,
}) {
  const finalSum = summed.reduce((prev, curr) => prev + curr, 0)
  let content = [userMention(userFlake), " rolled"]

  if (description) {
    content.push(` "${description}"`)
  }
  content.push(` until ${until} successes`)
  content.push(` at ${pool} dice`)
  content.push(explainThreshold(threshold))
  content.push(explainExplode(explode))
  content.push(":")
  content = content
    .concat(
      raw.map((result, index) => {
        return [
          `\n\t${bold(summed[index])} `,
          detailMany({
            pool,
            threshold,
            explode,
            raw: result,
          }),
        ].join(" ")
      })
    )
  content.push(`\n${bold(finalSum)} of ${until}`)
  content.push(` in ${raw.length} rolls`)

  return content.join("")
}

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
      return presentUntil(rollOptions)
    }
    if (rolls == 1) {
      return presentOne(rollOptions)
    }
    return presentMany(rollOptions)
  },
  presentOne,
  explainChance,
  detailOne,
  explainExplode,
  explainThreshold,
  explainRote,
  presentMany,
  detailMany,
  presentUntil
}
