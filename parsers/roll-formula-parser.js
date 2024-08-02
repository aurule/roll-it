const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")
const command = require("../commands/roll-formula")

const formula_re = /`(?<formula>.*)`/

module.exports = {
  name: "roll-formula",
  /**
   * Parse the presented output of the /roll-formula command
   *
   * @example
   * ```js
   * const content = '<@12345> rolled **14** on "example roll" `3d6 + 4`:'
   * parse(content)
   * // {
   * //   formula: 3d6 + 4
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

    const formula_groups = formula_re.exec(stripped_content)?.groups
    if (formula_groups) {
      raw_options.formula = formula_groups.formula
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
