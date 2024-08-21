const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")
const command = require("../commands/drh")
const { talentNames } = require("../presenters/drh-results-presenter")

module.exports = {
  name: "drh",
  /**
   * Parse the presented output of the drh command
   *
   * @example
   * ```js
   * const content = `
   * <@12345> rolled a **competant success** for "a roll" dominated by **pain**
   *   2 discipline (**3**, **2**, 4)
   *   0 madness (4)
   *   2 exhaustion (**1**, **2**)
   *   _4_ vs 3 pain (**3**, **1**, **2**, __5__)
   * `
   * // {
   * //   discipline: 3,
   * //   madness: 1,
   * //   exhaustion: 2,
   * //   pain: 4
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const rolls_re = /(?<rolls>\d+) times/
    const pool_re = /_*(?<name>\w+?)_*?\s+\((?<dice>.*?)\)/gm
    const commas_re = /,/g
    const talent_re = /a (?<name>[\w\s]+) talent/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    while ((pool_match = pool_re.exec(stripped_content)) !== null) {
      const pool_name = pool_match.groups.name
      const pool_value = (pool_match.groups.dice.match(commas_re) || []).length + 1
      raw_options[pool_name] = pool_value
      if (pool_name == "pain") break
    }

    const talent_groups = talent_re.exec(stripped_content)?.groups
    if (talent_groups) {
      raw_options.talent = talentNames.findKey(n => n === talent_groups.name)
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
