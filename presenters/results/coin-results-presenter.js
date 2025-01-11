const { bold } = require("discord.js")
const { i18n } = require("../../locales")

module.exports = {
  /**
   * Create a string describing the results of a coin flip
   *
   * @param  {int}          options.call        The side the user chose before rolling
   * @param  {String}       options.description Text describing the roll
   * @param  {Array<int[]>} options.raw         An array of one array with one numeric value for the die
   * @return {String}                           String describing this roll
   */
  present: ({ call, description, raw, locale = "en-US" }) => {
    const t = i18n.getFixedT(locale, "commands", "coin")
    const num = raw[0][0]

    const t_args = {
      description,
      result: t(`faces.${num}`),
    }

    const key_parts = ["response"]
    if (call) {
      key_parts.push("call")
      t_args.call = t(`faces.${call}`)
    } else {
      key_parts.push("bare")
    }

    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }

    const key = key_parts.join(".")
    return t(key, t_args)
  },
}
