const command = require("../commands/roll-formula")
const { parseValueOption, validateOptions, parseRollsOption } = require("../util/parser-helpers")

module.exports = {
  name: "roll-formula",
  /**
   * Parse the presented output of the /roll-formula command
   *
   * @example
   * ```js
   * const content = '<@12345> rolled **14** on "example roll" `3d6 + 4`:'
   * parse(content)
   * // {
   * //   formula: 3d6 + 4
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const formula_re = /`(?<formula>.*)`:/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.formula = parseValueOption(formula_re, content)
    raw_options.rolls = parseRollsOption(stripped_content)

    return await validateOptions(raw_options, command)
  },
}
