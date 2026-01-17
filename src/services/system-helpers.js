import { systems } from "../data/systems.js"

/**
 * Find systems that use the given commands
 *
 * Systems are returned only if the given command_names are a superset of that system's required commands.
 *
 * @param  {...string} command_names Array of command names
 * @return {System[]}                Array of system objects
 */
export function findByCommands(...command_names) {
  const name_set = new Set(command_names)

  return systems.filter((s) => name_set.isSupersetOf(new Set(s.commands.required)))
}
