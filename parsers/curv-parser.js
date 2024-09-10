const Joi = require("joi")

const command = require("../commands/curv")
const { parseValueOption, parseModifierOption, validateOptions, parseRollsOption } = require("../util/parser-helpers")

module.exports = {
  name: "curv",
  /**
   * Parse the presented output of the /curv command
   *
   * @example
   * ```js
   * const content = '<@12345> rolled **7** (9 [3, 4, 2] + 4) for "a roll"'
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
    const keep_re = /with (?<low>dis)?advantage/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.modifier = parseModifierOption(stripped_content)
    raw_options.rolls = parseRollsOption(stripped_content)

    const has_keep = keep_re.exec(stripped_content)
    if (has_keep) {
      raw_options.keep = !!has_keep.groups.low ? "lowest" : "highest"
    }

    return await validateOptions(raw_options, command)
  },
}
