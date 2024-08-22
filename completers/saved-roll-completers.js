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
      .slice(0, 25)
      .map((t) => {
        return {
          name: t.name.substring(0, 100),
          value: t.id.toString(),
        }
      })

    return matches
  },

  /**
   * Get the options for changeable roll attributes
   *
   * @param  {str}     partialText         The user's typed text
   * @param  {obj[]}   saved_rolls         Array of saved_roll info objects, as returned by UserSavedRolls.all()
   * @param  {options} interaction_options Object of options. Used to get the right command.
   * @return {obj[]}                       Array of choice objects
   */
  change_target(partialText, saved_rolls, interaction_options) {
    const search = partialText.toLowerCase()

    const name = interaction_options.getString("name")
    saved_roll = saved_rolls.find(r => r.id == name || r.name == name)

    const commands = require("../commands")
    const command = commands.get(saved_roll.command)
    if (!command) return []

    const matches = command.changeable
      .filter((c) => c.startsWith(search))
      .map(c => {
        return {
          name: c,
          value: c,
        }
      })

    return matches
  }
}
