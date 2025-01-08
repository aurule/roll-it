const { signed } = require("../../util/formatters")
const { indeterminate } = require("../../util/formatters")
const { i18n } = require("../../locales")

const emoji = [
  null,
  "<:fateneg:1280545320052330506>",
  "<:fatezero:1280545382698324068>",
  "<:fatepos:1280545364386119730>",
]

module.exports = {
  /**
   * Present one or more results from the fate command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ rolls, locale = "en-US", ...rollOptions } = {}) => {
    const presenter_options = {
      ...rollOptions,
      t: i18n.getFixedT(locale, "commands", "fate"),
    }
    if (rolls == 1) {
      return module.exports.presentOne(presenter_options)
    }
    return module.exports.presentMany(presenter_options)
  },

  /**
   * Describe the results of a single fate roll
   *
   * @param  {String}       options.description Text describing the roll
   * @param  {Array<int[]>} options.raw         Array of one array with ints representing raw dice rolls
   * @param  {int[]}        options.summed      Array of one int, summing the rolled dice
   * @param  {Int}          options.modifier    Number to add to the roll's summed result
   * @param  {i18n.t}       options.t           Translation function
   * @return {String}                           String describing the roll results
   */
  presentOne: ({ description, raw, summed, modifier, t }) => {
    const ladder_index = summed[0] + modifier + 5
    const t_args = {
      description,
      result: t(`ladder.${ladder_index}`),
      detail: module.exports.detail(raw[0], modifier),
      count: raw.length,
    }

    const key_parts = ["response"]
    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    return t(key, t_args)
  },

  /**
   * Describe the results of multiple fate rolls
   *
   * @param  {String}       options.description Text describing the roll
   * @param  {Array<int[]>} options.raw         Array of arrays with ints representing raw dice rolls
   * @param  {int[]}        options.summed      Array of ints, summing the rolled dice
   * @param  {Int}          options.modifier    Number to add to the roll's summed result
   * @param  {i18n.t}       options.t           Translation function
   * @return {String}                           String describing the roll results
   */
  presentMany: ({ description, raw, summed, modifier, t }) => {
    const t_args = {
      description,
      count: raw.length,
      results: raw.map((result, index) => {
        const ladder_index = summed[index] + modifier + 5
        const res_args = {
          ladder: t(`ladder.${ladder_index}`),
          detail: module.exports.detail(result, modifier),
        }
        return `\t${t("response.result", res_args)}`
      }).join("\n")
    }

    const key_parts = ["response"]
    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    return t(key, t_args)
  },

  /**
   * Describe a single roll's details
   *
   * @param  {Array<Int>} options.raw  Array with ints representing raw dice rolls
   * @param  {Int}    options.modifier Number to add to the roll's summed result
   * @return {String}                  String detailing a single roll
   */
  detail: (raw, modifier = 0) => {
    let detail = raw.map((face) => {
      return emoji[face]
    })

    if (modifier) {
      detail.push(signed(modifier))
    }

    return detail.join("")
  },
}
