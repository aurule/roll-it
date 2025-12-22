module.exports = {
  /**
   * Find features that use the given commands
   *
   * Features are returned only if the given command_names are a superset of that feature's required commands.
   *
   * @param  {...string} command_names Array of command names
   * @return {Feature[]}               Array of feature objects
   */
  findByCommands(...command_names) {
    const name_set = new Set(command_names)
    const { features } = require("../data")

    return features.filter(s => name_set.isSupersetOf(new Set(s.commands)))
  }
}
