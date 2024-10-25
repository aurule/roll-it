module.exports = {
  /**
   * Transforms an array of command objects into an array of select menu option
   * objects suitable for the options of a Discord String Select Menu.
   * @param  {Array}        commands  The commands to transform
   * @param  {Array}        deployed  Command names which should be set as default selections (optional)
   * @return {Array[Object]}          Array of select choices
   */
  transform: (commands, deployed = []) => {
    return commands.map((command) => {
      return {
        label: command.name,
        description: command.description,
        value: command.name,
        default: deployed.includes(command.name),
      }
    })
  },
}
