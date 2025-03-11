const { Collection } = require("discord.js")

/**
 * Cache class for storing data about rolls that are in progress of being saved
 *
 *
 * This stores one set of command data per user within each guild. The data is used by the Saved Roll Modal.
 */
class RollCache extends Collection {
  /**
   * Create a guild-level user command cache
   *
   * @return {LimitedCollection} A Collection object
   */
  guildCacheConstructor() {
    return new Collection()
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
   * @param  {Interaction} interaction Discord command interaction to save
   */
  store(interaction, data) {
    const guildUserCommands = this.ensure(interaction.guildId, this.guildCacheConstructor)
    guildUserCommands.set(interaction.user.id, data)
  }

  /**
   * Find a command using the guild and user from an interaction
   *
   * @param  {Interaction} interaction Discord command interaction to save
   * @return {object}                  Stored data
   */
  find(interaction) {
    return this.findByIds(interaction.guildId, interaction.user.id)
  }

  /**
   * Find a a command in the cache
   *
   * @param  {snowflake} guildId ID of the interaction's guild
   * @param  {snowflake} userId  ID of the interaction's user
   * @return {object}            Stored data
   */
  findByIds(guildId, userId) {
    const guildUserCommands = this.get(guildId)
    if (!guildUserCommands) return undefined

    return guildUserCommands.get(userId)
  }

  /**
   * Remove a command using the guild and user from an interaction
   *
   * @param  {Interaction} interaction Discord command interaction to save
   * @return {bool}                    True if an element existed and has been removed, False if not.
   */
  remove(interaction) {
    return this.deleteByIds(interaction.guildId, interaction.user.id)
  }

  /**
   * Remove a command from the cache
   *
   * Since each user in a guild can only have a single command, this also removes the user from that guild's
   * cache.
   *
   * @param  {snowflake} guildId ID of the interaction's guild
   * @param  {snowflake} userId  ID of the interaction's user
   * @return {bool}              True if an element existed and has been removed, False if not.
   */
  deleteByIds(guildId, userId) {
    const guildUserCommands = this.get(guildId)
    if (!guildUserCommands) return false

    return guildUserCommands.delete(userId)
  }
}

module.exports = new RollCache()
