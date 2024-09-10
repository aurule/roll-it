const command = require("../commands/drh")
const { talentNames } = require("../presenters/drh-results-presenter")
const { validateOptions, parseRollsOption } = require("../util/parser-helpers")

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
    const pool_re = /_*(?<name>\w+?)_*?\s+\((?<dice>.*?)\)/gm
    const commas_re = /,/g
    const talent_re = /a (?<name>[\w\s]+) talent/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    let pool_match
    while ((pool_match = pool_re.exec(stripped_content)) !== null) {
      const pool_name = pool_match.groups.name
      const pool_value = (pool_match.groups.dice.match(commas_re) || []).length + 1
      raw_options[pool_name] = pool_value
      if (pool_name == "pain") break
    }

    const talent_groups = talent_re.exec(stripped_content)?.groups
    if (talent_groups) {
      raw_options.talent = talentNames.findKey((n) => n === talent_groups.name)
    }

    raw_options.rolls = parseRollsOption(stripped_content)

    return await validateOptions(raw_options, command)
  },
}
