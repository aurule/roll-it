const { RollParseError } = require("../errors/roll-parse-error")

module.exports = {
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
