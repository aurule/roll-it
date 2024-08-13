const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")
const command = require("../commands/fate")

const modifier_re = /> (?<operator>\+|\-) (?<modifier>\d+)/
const rolls_re = /(?<rolls>\d+) times/

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
    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    const modifier_groups = modifier_re.exec(stripped_content)?.groups
    if (modifier_groups) {
      let mod = modifier_groups.modifier
      if (modifier_groups.operator == "-") mod = -1 * mod
      raw_options.modifier = mod
    }

    const rolls_groups = rolls_re.exec(stripped_content)?.groups
    if (rolls_groups) {
      raw_options.rolls = rolls_groups.rolls
    }

    var validated_options
    try {
      validated_options = await command.schema.validateAsync(raw_options, { abortEarly: false })
    } catch (err) {
      throw new RollParseError(err.details.map((d) => d.message))
    }

    return validated_options
  },
}
