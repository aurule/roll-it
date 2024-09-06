const Joi = require("joi")

const command = require("../commands/kob")
const { parseValueOption, parseModifierOption, validateOptions, parseRollsOption } = require("../util/parser-helpers")

module.exports = {
  name: "kob",
  /**
   * Parse the presented output of a singleton command
   *
   * Compatible commands are `/d10` and `/d100`. All such commands must have identical `schema` attributes.
   *
   * @example
   * ```js
   * const content = '<@12345> rolled **7** (3 + 4) for "a roll"'
   * parse(content)
   * // {
   * //   modifier: 4
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const sides_re = /d(?<sides>\d+)/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.sides = parseValueOption(sides_re, stripped_content)
    raw_options.rolls = parseRollsOption(stripped_content)
    raw_options.modifier = parseModifierOption(stripped_content)

    return await validateOptions(raw_options, command)
  },
}
