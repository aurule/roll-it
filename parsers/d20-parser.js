const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")
const command = require("../commands/d20")

const modifier_re = /(?<modifier>(?:- )?\d)\)/
const rolls_re = /(?<rolls>\d) times/
const keep_re = /with (?<low>dis)?advantage/

module.exports = {
  name: "d20",
  /**
   * Parse the presented output of the /d20 command
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
    const stripped_content = content.replace(/".*"/, '')
    const raw_options = {}

    const modifier_groups = modifier_re.exec(stripped_content)?.groups
    if (modifier_groups) {
      raw_options.modifier = modifier_groups.modifier
    }

    const rolls_groups = rolls_re.exec(stripped_content)?.groups
    if (rolls_groups) {
      raw_options.rolls = rolls_groups.rolls
    }

    const has_keep = keep_re.exec(stripped_content)
    if (has_keep) {
      raw_options.keep = !!has_keep.groups.low ? "lowest" : "highest"
    }

    var validated_options
    try {
      validated_options = await command.schema.validateAsync(raw_options, {abortEarly: false})
    } catch(err) {
      throw new RollParseError(err.details.map(d => d.message))
    }

    return validated_options
  },
}
