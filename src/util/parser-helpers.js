import { RollParseError } from "../errors/roll-parse-error"

/**
 * Validate an object of command options against a command using its schema
 *
 * @param  {object}  options Options object to validate
 * @param  {Command} command Command object to validate against. Must have a schema attribute.
 * @return {object}          Validated and sanitized options object.
 *
 * @throws RollParseError On nvalid options.
 */
export async function validateOptions(options, command) {
  try {
    return await command.schema.validateAsync(options, { abortEarly: false })
  } catch (err) {
    throw new RollParseError(err.details.map((d) => d.message))
  }
}
