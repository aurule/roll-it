module.exports = {
  /**
   * Transforms system objects into select menu options including descriptions
   *
   * @param  {Array}        systems  The systems to transform
   * @param  {Array}        deployed System names which should be set as default selections (optional)
   * @return {Array[Object]}         Array of select choices
   */
  withDescriptions: (systems, deployed = []) => {
    return systems.map((system) => {
      return {
        label: system.title,
        description: system.description,
        value: system.name,
        default: deployed.includes(system.name),
      }
    })
  },

  /**
   * Transforms system objects into select menu options including command names
   *
   * @param  {Array}        systems  The systems to transform
   * @param  {Array}        deployed System names which should be set as default selections (optional)
   * @return {Array[Object]}         Array of select choices
   */
  withCommands: (systems, deployed = []) => {
    return systems.map((system) => {
      const all_commands = system.commands.required.concat(system.commands.recommended ?? [])

      const command_names = all_commands.map(c => `/${c}`).join(", ")

      return {
        label: system.title,
        description: command_names,
        value: system.name,
        default: deployed.includes(system.name),
      }
    })
  },
}
