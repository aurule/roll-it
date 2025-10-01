const { strikethrough } = require("discord.js")
const { operator } = require("../../util/formatters")
const { i18n } = require("../../locales")

/**
 * Describe a single roll result
 *
 * @param  {Int[]} result   Array of raw die numbers
 * @param  {int[]} indexes  Array of indexes kept after rolling
 * @param  {Int}   modifier Number to add to the raw die
 * @param  {int}   summed   Result dice added together
 * @return {string}         Description of the result and modifier
 */
function detail({ result, indexes, summed, modifier = 0 } = {}) {
  const nums = result
    .map((res, idx) => {
      if (indexes.includes(idx)) {
        return `${res}`
      } else {
        return strikethrough(res)
      }
    })
    .join(", ")
  const selection = `[${nums}]`

  if (modifier !== 0) {
    return `${selection}${operator(modifier)}`
  } else {
    return selection
  }
}

module.exports = {
  /**
   * Present one or more results from the d20 command
   *
   * @param  {Int}          options.rolls        Total number of rolls to show
   * @param  {str}          options.locale       Name of the locale to use when fetching strings
   * @param  {Int}          opptions.modifier    Number to add to the roll's summed result
   * @param  {String}       opptions.description Text describing the roll
   * @param  {Array<int[]>} opptions.raw         An array of one array with multiple numeric values for the die
   * @param  {obj}          opptions.picked      Object of results and indexes after picking highest or lowest
   * @param  {int[]}        opptions.summed      Array of ints, summing the rolled dice
   * @return {String}                            String describing the roll results
   */
  present: ({ rolls, locale = "en-US", modifier = 0, description, raw, picked, summed } = {}) => {
    const t = i18n.getFixedT(locale, "commands", "swn")

    const t_args = {
      context: description ? "desc" : "bare",
      count: rolls,
      description,
      total: summed[0] + modifier,
      detail: detail({ result: raw[0], indexes: picked[0].indexes, summed: summed[0], modifier }),
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
