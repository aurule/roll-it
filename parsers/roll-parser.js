const Joi = require("joi")

const command = require("../commands/roll")
const { parseValueOption, parseModifierOption, validateOptions, parseRollsOption } = require("../util/parser-helpers")

module.exports = {
  name: "roll",
  /**
   * Parse the presented output of the /roll command
   *
   * @example
   * ```js
   * const content = '<@12345> rolled **7** "example roll" (1d6: [5] + 2)'
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
    const pool_re = /(?<pool>\d+)d(?<sides>\d+)/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    const pool_groups = pool_re.exec(stripped_content)?.groups
    if (pool_groups) {
      raw_options.pool = pool_groups.pool
      raw_options.sides = pool_groups.sides
    }

    raw_options.modifier = parseModifierOption(stripped_content)
    raw_options.rolls = parseRollsOption(stripped_content)

    return await validateOptions(raw_options, command)
  },
}
