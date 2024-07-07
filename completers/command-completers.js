module.exports = {
  /**
   * Completer for looking up commands
   *
   * @param  {str} partialText The user's typed text
   * @return {obj[]}           Array of choice objects
   */
  all(partialText) {
    const commands = require("../commands")
    const search = partialText.toLowerCase()

    return commands.all_choices.filter((c) => c.name.toLowerCase().startsWith(search))
  },
}
