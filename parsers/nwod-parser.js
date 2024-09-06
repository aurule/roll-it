const Joi = require("joi")

const command = require("../commands/nwod")
const { parseValueOption, parseBooleanOption, validateOptions, parseRollsOption } = require("../util/parser-helpers")

module.exports = {
  name: "nwod",
  /**
   * Parse the presented output of the /nwod command
   *
   * @example
   * ```js
   * const content = '{{userMention}} rolled **2** for "example roll" (5: [3, 8, 6, 5, 9])'
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
    const explode_re = /(?<no>no )?(?<explode>\d+)-again/
    const threshold_re = /on (?<threshold>\d+)/
    const rote_re = /rote/
    const until_re = /until (?<until>\d+)/
    const decreasing_re = /decreasing/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.pool = parseValueOption(pool_re, stripped_content)
    raw_options.threshold = parseValueOption(threshold_re, stripped_content)
    raw_options.rolls = parseRollsOption(stripped_content)
    raw_options.until = parseValueOption(until_re, stripped_content)
    raw_options.rote = parseBooleanOption(rote_re, stripped_content)
    raw_options.decreasing = parseBooleanOption(decreasing_re, stripped_content)

    const explode_groups = explode_re.exec(stripped_content)?.groups
    if (explode_groups) {
      raw_options.explode = explode_groups.no ? 11 : explode_groups.explode
    }

    return await validateOptions(raw_options, command)
  },
}
