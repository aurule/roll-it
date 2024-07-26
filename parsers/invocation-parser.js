const Joi = require("joi")
const { schemaErrors } = require("../util/schema-errors")

const command_re = /\/(?<command>\w+)/
const args_re = /(\s+)?(?<name>\w+):(?<value>([\w+-/^*]+\s*)+(\s|$))/g

module.exports = {
  parse(invocation) {
    const savable_commands = require("../commands").savable()

    const groups = invocation.match(command_re).groups
    const command_name = groups.command

    const options = {}
    const command_args = invocation.matchAll(args_re)
    for (const arg of command_args) {
      const name = arg.groups.name
      const value = arg.groups.value
      options[name] = value
    }

    const command = savable_commands.get(command_name)
    if (command === undefined) {
      return {
        errors: [`cannot save ${command_name}`]
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
