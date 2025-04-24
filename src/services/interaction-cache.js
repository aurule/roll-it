const { Keyv } = require("keyv")

/**
 * Cache class for storing data from command interactions
 *
 * This stores the command name and options for command interactions on every guild. Records are retained for
 * two days. This data is looked up by the `Save this command` context-menu command in order to know what to
 * save.
 */
class InteractionCache extends Keyv {
  constructor() {
    // default TTL of two days
    super({ ttl: 1.728e8 })
  }

  /**
   * Save data about an interaction
   *
   * This extracts the command options and command name, and saves them in a structured object.
   *
   * @param  {Interaction} interaction Discord command interaction to save
   */
  async set(interaction) {
    const options = new Object()
    try {
      interaction.options.data.map((discordOption) => {
        options[discordOption.name] = discordOption.value
      })
    } catch {
      return
    }

    const data = {
      commandName: interaction.commandName,
      options,
    }
    return super.set(interaction.id, data)
  }

  /**
   * Get an interaction from the cache
   *
   * @param  {Interaction} interaction Interaction to look up
   * @return {object}                  Object with the command and options used in the saved interaction
   */
  async getInteraction(interaction) {
    return super.get(interaction.id)
  }

  /**
   * Get an interaction from the cache using a message object
   *
   * @param  {Message} message Message from the interaction to look up
   * @return {object}          Object with the command and options used in the saved interaction
   */
  async getMessage(message) {
    return super.get(message.interactionMetadata.id)
  }
}

module.exports = new InteractionCache()
