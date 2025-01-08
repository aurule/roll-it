const { bold } = require("discord.js")
const { i18n } = require("../../locales")

module.exports = {
  /**
   * Create a string describing the results of a coin flip
   *
   * @param  {String}   options.call          The side the user chose before rolling
   * @param  {String}   options.description   Text describing the roll
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @return {String}                         String describing this roll
   */
  present: ({ call, description, raw, locale = "en-US" }) => {
    const t = i18n.getFixedT(locale, "commands", "coin")
    const num = raw[0][0]

    const result = t(`faces.${num}`)

    const key_part = call ? "response.call" : "response.bare"
    if (description) {
      return t(`${key_part}.withDescription`, { call, result, description })
    }
    return t(`${key_part}.withoutDescription`, { call, result, description })
  },
}
