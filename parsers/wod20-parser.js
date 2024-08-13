const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")
const command = require("../commands/wod20")

const pool_re = /(?<pool>\d+) diff (?<difficulty>\d+)/
const specialty_re = /specialty/
const rolls_re = /(?<rolls>\d+) times/
const until_re = /until (?<until>\d+)/

module.exports = {
  name: "wod20",
  /**
   * Parse the presented output of the /wod20 command
   *
   * @example
   * ```js
   * const content = '{{userMention}} rolled **0** for "exmaple roll" (5 diff 7: [5, 3, **8**, 2,~~1~~])'
   * parse(content)
   * // {
   * //   pool: 5,
   * //   difficulty: 7,
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

    const pool_groups = pool_re.exec(stripped_content)?.groups
    if (pool_groups) {
      raw_options.pool = pool_groups.pool
      raw_options.difficulty = pool_groups.difficulty
    }

    const has_specialty = specialty_re.test(stripped_content)
    if (has_specialty) {
      raw_options.specialty = true
    }

    const rolls_groups = rolls_re.exec(stripped_content)?.groups
    if (rolls_groups) {
      raw_options.rolls = rolls_groups.rolls
    }

    const until_groups = until_re.exec(stripped_content)?.groups
    if (until_groups) {
      raw_options.until = until_groups.until
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
