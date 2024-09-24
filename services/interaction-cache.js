const { Collection, LimitedCollection } = require("discord.js")

/**
 * Cache class for storing data from command interactions
 *
 * This stores the command name and options for the most recent 1000 interactions for a given guild. This data
 * is looked up by the `Save this command` context-menu command in order to know what to save.
 */
class InteractionCache extends Collection {
  /**
   * Create a guild-level interaction cache
   *
   * @return {LimitedCollection} A LimitedCollection object with a max of 1000 entries.
   */
  defaultCacheConstructor() {
    return new LimitedCollection({
      maxSize: 1000,
    })
  }

  /**
   * Save data about an interaction
   *
   * The data is stored first by the interaction's guild ID, then by its own ID.
   *
   * @param  {Interaction} interaction Discord command interaction to save
   */
  store(interaction) {
    const options = new Object()
    try {
      interaction.options.data.map((discordOption) => {
        options[discordOption.name] = discordOption.value
      })
    } catch {
      return
    }

    const guildInteractions = this.ensure(interaction.guildId, this.defaultCacheConstructor)
    guildInteractions.set(interaction.id, {
      commandName: interaction.commandName,
      options,
    })
  }

  /**
   * Find an interaction in the cache
   *
   * @param  {snowflake} guildId       ID of the interaction's guild
   * @param  {snowflake} interactionId ID of the interaction
   * @return {object}                  Object with the command and options used in the saved interaction
   */
  findByIds(guildId, interactionId) {
    const guildInteractions = this.get(guildId)
    if (!guildInteractions) return undefined

    return guildInteractions.get(interactionId)
  }

  /**
   * Find an interaction using data from a message
   *
   * This is the main entry point for `Save this command`
   *
   * @param  {Message} message The message object to use, as from interaction.targetMessage
   * @return {object}                  Object with the command and options used in the saved interaction
   */
  findByMessage(message) {
    return this.findByIds(message.guildId, message.interactionMetadata.id)
  }

  /**
   * Find an interaction by its own attributes
   *
   * This is meant to be used by tests.
   *
   * @param  {Interaction} interaction Interaction object to use
   * @return {object}                  Object with the command and options used in the saved interaction
   */
  findByInteraction(interaction) {
    return this.findByIds(interaction.guildId, interaction.id)
  }
}

module.exports = new InteractionCache()
