const {Keyv} = require("keyv")

/**
 * Cache class for storing data about rolls that are in progress of being saved
 *
 * This stores one set of command data per user within each guild. The data is used by the Saved Roll Modal.
 */
class RollCache extends Keyv {
  makeId(interaction) {
    return `${interaction.guildId}-${interaction.user.id}`
  }

  /**
   * Save command data for a guild and user
   *
   * The data is stored first by the interaction's guild ID, then by the user ID.
   *
   * The data itself must mimic a saved_rolls record:
   * {
   *   id?: int
   *   name: str
   *   description: str
   *   command: str
   *   options: obj
   * }
   *
   * @param {Interaction} interaction Discord command interaction to save
   * @param {object} data Saved roll data to store
   */
  async set(interaction, data) {
    const id = this.makeId(interaction)
    return super.set(id, data)
  }

  /**
   * Find a command using the guild and user from an interaction
   *
   * @param  {Interaction} interaction Discord command interaction to save
   * @return {object}                  Stored data
   */
  async get(interaction) {
    const id = this.makeId(interaction)
    return super.get(id)
  }

  /**
   * Remove a command using the guild and user from an interaction
   *
   * @param  {Interaction} interaction Discord command interaction to save
   * @return {bool}                    True if an element existed and has been removed, False if not.
   */
  async delete(interaction) {
    const id = this.makeId(interaction)
    return super.delete(id)
  }
}

module.exports = new RollCache()
