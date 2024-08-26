const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")
const command = require("../commands/nwod")

module.exports = {
  name: "nwod",
  /**
   * Parse the presented output of the /nwod command
   *
   * @example
   * ```js
   * const content = '{{userMention}} rolled **2** for "example roll" (5: [3, 8, 6, 5, 9])'
   * parse(content)
   * // {
   * //   pool: 5,
   * // }
   * ```
   *
   * @param  {str} content Command execution output
   * @return {obj}         Object of command options
   *
   * @throws RollParseError On an invalid content string or invalid options.
   */
  async parse(content) {
    const pool_re = /(\(|at |with )(?<pool>\d+)/
    const explode_re = /(?<no>no )?(?<explode>\d+)-again/
    const threshold_re = /on (?<threshold>\d+)/
    const rote_re = /rote/
    const rolls_re = /(?<rolls>\d+) times/
    const until_re = /until (?<until>\d+)/

    const stripped_content = content.replace(/".*"/, "")
    const raw_options = {}

    const pool_groups = pool_re.exec(stripped_content)?.groups
    if (pool_groups) {
      raw_options.pool = pool_groups.pool
    }

    const explode_groups = explode_re.exec(stripped_content)?.groups
    if (explode_groups) {
      raw_options.explode = explode_groups.no ? 11 : explode_groups.explode
    }

    const threshold_groups = threshold_re.exec(stripped_content)?.groups
    if (threshold_groups) {
      raw_options.threshold = threshold_groups.threshold
    }

    const has_rote = rote_re.test(stripped_content)
    if (has_rote) {
      raw_options.rote = true
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
