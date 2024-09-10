const command = require("../commands/wod20")
const {
  parseValueOption,
  parseBooleanOption,
  validateOptions,
  parseRollsOption,
} = require("../util/parser-helpers")

module.exports = {
  name: "wod20",
  /**
   * Parse the presented output of the /wod20 command
   *
   * @example
   * ```js
   * const content = '{{userMention}} rolled **0** for "exmaple roll" (5 diff 7: [5, 3, **8**, 2,~~1~~])'
   * parse(content)
   * // {
   * //   pool: 5,
   * //   difficulty: 7,
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const pool_re = /(?<pool>\d+) diff/
    const diff_re = /diff (?<difficulty>\d+)/
    const specialty_re = /specialty/
    const until_re = /until (?<until>\d+)/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.pool = parseValueOption(pool_re, stripped_content)
    raw_options.difficulty = parseValueOption(diff_re, stripped_content)
    raw_options.specialty = parseBooleanOption(specialty_re, stripped_content)
    raw_options.rolls = parseRollsOption(stripped_content)
    raw_options.until = parseValueOption(until_re, stripped_content)

    return await validateOptions(raw_options, command)
  },
}
