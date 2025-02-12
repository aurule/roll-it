const { bold } = require("discord.js")
const { operator } = require("../../util/formatters")
const { i18n } = require("../../locales")

module.exports = {
  /**
   * Present one or more results from a singleton roll command
   *
   * This is meant to present the output for commands like d20 and d100, where there is only ever a single die
   * result.
   *
   * @param  {Int}          options.rolls       Total number of rolls to show
   * @param  {Int}          options.modifier    Number to add to the roll's summed result
   * @param  {String}       options.description Text describing the roll
   * @param  {Array<int[]>} options.raw         An array of arrays with one numeric value for the die
   * @return {String}                           String describing the roll results
   */
  present: ({ rolls, modifier = 0, description, raw, locale = "en-US" } = {}) => {
    const t = i18n.getFixedT(locale, "commands", "singleton")

    const key_parts = ["response"]
    const result_parts = ["response"]

    if (modifier !== 0) {
      key_parts.push("modifier")
      result_parts.push("modifier")
    } else {
      key_parts.push("bare")
      result_parts.push("bare")
    }

    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    result_parts.push("result")
    const result_key = result_parts.join(".")
    const t_args = {
      count: rolls,
      description,
      total: raw[0][0] + modifier,
      detail: `${raw[0][0]}${operator(modifier)}`,
      results: raw
        .map((result, idx) => {
          return (
            "\t" +
            t(result_key, {
              total: result[0] + modifier,
              detail: `${result[0]}${operator(modifier)}`,
            })
          )
        })
        .join("\n"),
    }

    const key = key_parts.join(".")
    return t(key, t_args)
  },
}
