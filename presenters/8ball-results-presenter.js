const { i18n } = require("../locales")

module.exports = {
  /**
   * Create a string describing the results of a roll of the magic 8 ball
   *
   * @param  {String}   options.question      Question the roll is for
   * @param  {bool}     options.doit          Whether to always reply "Do it"
   * @param  {Array<Array<Int>>} options.raw  An array of one array with one numeric value for the die
   * @return {String}                         String describing this roll
   */
  present: ({ question, doit, raw, locale = "en-US" }) => {
    const t = i18n.getFixedT(locale, "commands", "8ball")

    let result
    if (doit) {
      result = t("doit")
    } else {
      const num = raw[0][0]
      result = t(`faces.${num}`)
    }

    return t("response", { question, result })
  },
}
