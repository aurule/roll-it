const { strikethrough } = require("discord.js")
const { operator } = require("../../util/formatters")
const { i18n } = require("../../locales")

/**
 * Describe a single roll result
 *
 * @param  {object} options
 * @param  {Int[]}  options.result   Array of raw die numbers
 * @param  {int[]}  options.indexes  Array of indexes kept after rolling
 * @param  {int}    options.pool     Number of dice in the pool
 * @param  {Int}    options.modifier Number to add to the raw die
 * @param  {bool}   options.reroll   Whether 1s were re-rolled
 * @param  {i18n}   options.t        Translation function
 * @return {string}                  Description of the result and modifier
 */
function detail({ result, indexes, pool = 2, modifier = 0, reroll, t } = {}) {
  const parts = []
  const nums = result
    .map((res, idx) => {
      if (indexes.includes(idx)) {
        return `${res}`
      } else {
        return strikethrough(res)
      }
    })
    .join(", ")
  parts.push(`${pool}d6: [${nums}]`)

  if (modifier !== 0) {
    parts.push(`${operator(modifier)}`)
  }
  if (reroll) {
    parts.push(t("reroll"))
  }
  return parts.join("")
}

module.exports = {
  /**
   * Present one or more results from the d20 command
   *
   * @param  {object}       options
   * @param  {int}          options.pool         Number of dice in the pool
   * @param  {Int}          options.rolls        Total number of rolls to show
   * @param  {bool}         options.reroll       Whether 1s were re-rolled
   * @param  {str}          options.locale       Name of the locale to use when fetching strings
   * @param  {Int}          options.modifier     Number to add to the roll's summed result
   * @param  {String}       options.description  Text describing the roll
   * @param  {Array<int[]>} options.raw          An array of one array with multiple numeric values for the die
   * @param  {obj}          options.picked       Object of results and indexes after picking highest or lowest
   * @param  {int[]}        options.summed       Array of ints, summing the rolled dice
   * @return {String}                            String describing the roll results
   */
  present: ({ pool = 2, rolls = 1, reroll = false, locale = "en-US", modifier = 0, description, raw, picked, summed } = {}) => {
    const t = i18n.getFixedT(locale, "commands", "swn")

    const t_args = {
      context: description ? "desc" : "bare",
      count: rolls,
      description,
      total: summed[0] + modifier,
      detail: detail({ result: raw[0], indexes: picked[0].indexes, pool, modifier, reroll, t }),
      results: raw
        .map((result, idx) => {
          const details = detail({
            result,
            indexes: picked[idx].indexes,
            summed: summed[idx],
            modifier,
          })
          const total = summed[idx] + modifier
          return "\t" + t("result", { total, detail: details })
        })
        .join("\n"),
    }

    return t("response", t_args)
  },
  detail,
}
