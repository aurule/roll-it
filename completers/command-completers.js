module.exports = {
  /**
   * Completer for looking up commands
   *
   * @param  {str} partialText The user's typed text
   * @return {obj[]}           Array of choice objects
   */
  all(partialText) {
    const commands = require("../commands")
    const search = partialText.normalize().toLowerCase()

    return commands.all_choices.filter((c) => c.name.normalize().toLowerCase().startsWith(search)).slice(0, 25)
  },
}
