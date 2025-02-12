/**
 * Autocomplete functions used by the /table family of commands
 *
 * These are invoked by that command's `autcomplete` function. Their code lives
 * here for easier testing.
 */
module.exports = {
  /**
   * Completer for looking up existing tables
   *
   * @param  {str}   partialText The user's typed text
   * @param  {obj[]} tables      Array of table info objects, as returned by GuildRollables.all()
   * @return {obj[]}             Array of choice objects
   */
  table(partialText, tables) {
    const search = partialText.normalize().toLowerCase()

    const matches = tables
      .filter((t) => t.name.normalize().toLowerCase().startsWith(search))
      .slice(0, 25)
      .map((t) => {
        return {
          name: t.name.substring(0, 100),
          value: t.id.toString(),
        }
      })

    return matches
  },
}
