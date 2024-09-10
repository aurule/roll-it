const command = require("../commands/shadowrun")
const { parseValueOption, parseBooleanOption, validateOptions, parseRollsOption } = require("../util/parser-helpers")

module.exports = {
  name: "shadowrun",
  /**
   * Parse the presented output of the /shadowrun command
   *
   * @example
   * ```js
   * const content = '{{userMention}} rolled **2** for "example roll" (5: [3, 5, 1, 5, 4])'
   * parse(content)
   * // {
   * //   pool: 5,
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const pool_re = /(\(|at |with )(?<pool>\d+)/
    const edge_re = /rule of six/
    const until_re = /until (?<until>\d+)/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.pool = parseValueOption(pool_re, stripped_content)
    raw_options.edge = parseBooleanOption(edge_re, stripped_content)
    raw_options.rolls = parseRollsOption(stripped_content)
    raw_options.until = parseValueOption(until_re, stripped_content)

    return await validateOptions(raw_options, command)
  },
}
