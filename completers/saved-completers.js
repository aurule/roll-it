/**
 * Autocomplete functions used by the /table family of commands
 *
 * These are invoked by that command's `autcomplete` function. Their code lives
 * here for easier testing.
 */
module.exports = {
  /**
   * Completer for looking up existing saved rolls
   *
   * @param  {str}   partialText The user's typed text
   * @param  {obj[]} saved_rolls Array of saved_roll info objects, as returned by UserSavedRolls.all()
   * @return {obj[]}             Array of choice objects
   */
  saved_roll(partialText, saved_rolls) {
    const search = partialText.toLowerCase()

    const matches = saved_rolls
      .filter((t) => t.name.toLowerCase().startsWith(search))
      .map((t) => {
        return {
          name: t.name.substring(0, 100),
          value: t.id.toString(),
        }
      })

    return matches
  },
}
