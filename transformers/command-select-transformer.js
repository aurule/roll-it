module.exports = {
  /**
   * Transforms an array of command objects into an array of select menu option
   * objects suitable for the options of a Discord String Select Menu.
   * @param  {Array}        commands  The commands to transform
   * @return {Array[Object]}          Array of select choices
   */
  transform: (commands) => {
    return commands.map((command) => {
      return {
        label: `${command.name}`,
        description: `${command.description}`,
        value: `${command.name}`,
      }
    })
  },
}
