module.exports = {
  /**
   * Transforms an array of system objects into an array of select menu option
   * objects suitable for the options of a Discord String Select Menu.
   *
   * @param  {Array}        systems  The systems to transform
   * @param  {Array}        deployed System names which should be set as default selections (optional)
   * @return {Array[Object]}         Array of select choices
   */
  transform: (systems, deployed = []) => {
    return systems.map((system) => {
      return {
        label: system.title,
        description: system.description,
        value: system.name,
        default: deployed.includes(system.name),
      }
    })
  },
}
