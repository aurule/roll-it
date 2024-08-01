const Joi = require("joi")
const { RollParseError } = require("../errors/roll-parse-error")

const command_re = /\/(?<command>[\w-]+)/
const args_re = /(\s+)?(?<name>\w+):(?<value>([\w+-/^*]+\s*)+(\s|$))/g

module.exports = {
  name: "invocation",
  /**
   * Parse a command invocation string
   *
   * These take the format of `/command optionInt:5 optionBool:true optionStr:some kind of string optionN:value
   *
   * @param  {str} invocation Invocation string
   * @return {obj}            Object with a command and options attribute if the command was savable.
   *
   * @throws RollParseError On an invalid invocation string, non-savable command, or invalid options.
   */
  async parse(invocation) {
    const commands = require("../commands")

    const groups = invocation.match(command_re)?.groups
    if (!groups) {
      throw new RollParseError([`invalid invocation "${invocation}"`])
    }
    const command_name = groups.command

    const options = {}
    const command_args = invocation.matchAll(args_re)
    for (const arg of command_args) {
      const name = arg.groups.name
      const value = arg.groups.value
      options[name] = value
    }

    const command = commands.get(command_name)
    if (!(command?.savable)) {
      throw new RollParseError([`cannot save "${command_name}"`])
    }

    var validated_options
    try {
      validated_options = await command.schema.validateAsync(options, {abortEarly: false})
    } catch(err) {
      throw new RollParseError(err.details.map(d => d.message))
    }

    return {
      command: command_name,
      options: validated_options,
    }
  },
}
