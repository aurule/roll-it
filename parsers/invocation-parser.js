const Joi = require("joi")
const { schemaErrors } = require("../util/schema-errors")

const command_re = /\/(?<command>\w+)/
const args_re = /(\s+)?(?<name>\w+):(?<value>([\w+-/^*]+\s*)+(\s|$))/g

module.exports = {
  /**
   * Parse a command invocation string
   *
   * These take the format of `/command optionInt:5 optionBool:true optionStr:some kind of string optionN:value
   *
   * @param  {str} invocation Invocation string
   * @return {obj}            Object with at least an errors member, and also command and options if the command was savable.
   */
  parse(invocation) {
    const commands = require("../commands")

    const groups = invocation.match(command_re)?.groups
    if (!groups) {
      return {
        errors: [`invalid invocation "${invocation}"`]
      }
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
    if (!(command && command.savable)) {
      return {
        errors: [`cannot save "${command_name}"`]
      }
    }

    const validated = command.schema.validate(options, {abortEarly: false})

    return {
      command: command_name,
      options: validated.value,
      errors: schemaErrors(validated),
    }
  },
}
