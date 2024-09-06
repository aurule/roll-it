const Joi = require("joi")

const command = require("../commands/fate")
const { validateOptions, parseRollsOption, parseModifierOption } = require("../util/parser-helpers")

module.exports = {
  name: "fate",
  /**
   * Parse the presented output of the /fate command
   *
   * @example
   * ```js
   * const content = '<@12345> rolled **a Great (+3)** for "example roll": <:emoji:12345><:emoji:12345><:emoji:12345><:emoji:12345> + 3'
   * parse(content)
   * // {
   * //   modifier: 3
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const modifier_re = /> (?<operator>\+|\-) (?<modifier>\d+)/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    raw_options.modifier = parseModifierOption(stripped_content, modifier_re)
    raw_options.rolls = parseRollsOption(stripped_content)

    return await validateOptions(raw_options, command)
  },
}
