module.exports = {
  /**
   * Find systems that use the given commands
   *
   * Systems are returned only if the given command_names are a superset of that system's required commands.
   *
   * @param  {...string} command_names Array of command names
   * @return {System[]}                Array of system objects
   */
  findByCommands(...command_names) {
    const name_set = new Set(command_names)
    const { systems } = require("../data")

    return systems.filter((s) => name_set.isSupersetOf(new Set(s.commands.required)))
  },
}
