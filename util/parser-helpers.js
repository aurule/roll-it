const { RollParseError } = require("../errors/roll-parse-error")

const modifier_re = /(?<operator>\+|\-) (?<modifier>\d+)\)/
const rolls_re = /(?<rolls>\d+) times/

module.exports = {
  /**
   * Parse the value for a command option from its presented output
   *
   * The option_re regex MUST have a single named capture group.
   *
   * @param  {regex}         option_re Regex to match against the content
   * @param  {str}           content   Content to extract from
   * @return {any|undefined}           Option value. Undefined if the option is not found.
   */
  parseValueOption(option_re, content) {
    const groups = option_re.exec(content)?.groups
    for (const name in groups) {
      return groups[name]
    }
    return undefined
  },

  /**
   * Parse the value for the common modifier option
   *
   * This function normally works as-is, but can be given an override regex in case the default one doesn't
   * work. In that case, the override regex MUST have both an "operator" and "modifier" named capture group.
   *
   * @param  {str}           content  Content to extract from
   * @param  {regex}         override Regex to match against the content
   * @return {int|undefined}          Modifier value. Undefined if modifier is not found.
   */
  parseModifierOption(content, override) {
    const mod_re = override ?? modifier_re
    mod_re.lastIndex = 0

    const groups = mod_re.exec(content)?.groups
    if (!groups) return undefined

    let mod = Number(groups.modifier)
    if (groups.operator == "-") mod = -1 * mod
    return mod
  },

  /**
   * Parse the value for the common rolls option
   *
   * @param  {str}           content  Content to extract from
   * @return {int|undefined}          Rolls value. Undefined if modifier is not found.
   */
  parseRollsOption(content) {
    rolls_re.lastIndex = 0
    const value = module.exports.parseValueOption(rolls_re, content)
    return value === undefined ? undefined : Number(value)
  },

  /**
   * Parse the value for a boolean option
   *
   * There are no restrictions on the option_re regex. If it matches, this will return true. Otherwise, it
   * will return undefined. This helper will never return false.
   *
   * @param  {regex}          option_re Regex to match against the content
   * @param  {str}            content   Content to extract from
   * @return {bool|undefined}           Option value. Undefined if the option is not found.
   */
  parseBooleanOption(option_re, content) {
    return option_re.test(content) ? true : undefined
  },

  /**
   * Validate an object of command options against a command using its schema
   *
   * @param  {obj} options Options object to validate
   * @param  {obj} command Command object to validate against. Must have a schema attribute.
   * @return {obj}         Validated and sanitized options object.
   *
   * @throws RollParseError On nvalid options.
   */
  async validateOptions(options, command) {
    try {
      return await command.schema.validateAsync(options, { abortEarly: false })
    } catch (err) {
      throw new RollParseError(err.details.map((d) => d.message))
    }
  },
}
