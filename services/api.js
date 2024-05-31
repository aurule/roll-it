/**
 * Module to isolate calls to discord API endpoints.
 */

require("dotenv").config()

const { REST, Routes } = require("discord.js")
const commands = require("../commands")
const { logger } = require("../util/logger")

const client = new REST().setToken(process.env.BOT_TOKEN)

const botId = process.env.CLIENT_ID

/**
 * Create JSON for a set of commands
 *
 * The JSON uses each command's data() method for generation. This method must return an object with its
 * own toJSON implementation.
 *
 * @param  {Command[]} cmds Array of command objects
 * @return {Object[]}       Array of generated JSON for the given commands
 */
function commandsToJSON(cmds) {
  return cmds.map(c => c.data().toJSON())
}

module.exports = {
  client,
  commandsToJSON,

  /**
   * Get the list of deployed global commands
   *
   * @return {Promise<Array>} Promise resolving to an array of command objects
   */
  async getGlobalCommands() {
    logger.info("Begin getting global commands")
    return client.get(Routes.applicationCommands(botId))
      .catch((error) => {
        logger.warn(error, "Error getting global commands")
      })
      .finally(() => {
        logger.info("Done getting global commands")
      })
  },

  async setGlobalCommands() {
    const global_json = commandsToJSON(commands.global())

    logger.info("Begin setting global commands")
    return client.put(
      Routes.applicationCommands(botId),
      {
        body: global_json
      }
    )
      .catch((error) => {
        logger.warn(error, "Error setting global commands")
      })
      .finally(() => {
        logger.info("Done setting global commands")
      })
  },

  async updateGlobalCommand(commandName, commandId) {
    const command_json = commands.globals().get(commandName).data().toJSON()

    logger.info({command: commandName}, "Begin updating global command")
    return client.patch(
        Routes.applicationCommand(botId, commandId),
        {
          body: command_json
        }
      )
      .catch((error) => {
        logger.warn(error, `Error updating global command ${commandName}`)
      })
      .finally(() => {
        logger.info({command: commandName}, "Done updating global command")
      })
  },

  async getGuilds() {
    logger.info("Begin getting installed guilds")
    return client.get(Routes.userGuilds(botId))
      .catch((error) => {
        logger.warn(error, "Error getting guilds")
      })
      .finally(() => {
        logger.info("Done getting guilds")
      })
  },

  async getGuildCommands(guildId) {
    logger.info({guild: guildId}, "Begin getting guild commands")
    return client.get(Routes.applicationGuildCommands(botId, guildId))
      .catch((error) => {
        logger.warn(error, `Error getting guild commands for ${guildId}`)
      })
      .finally(() => {
        logger.info({guild: guildId}, "Done getting guild commands")
      })
  },

  async setGuildCommands(guildId) {
    const guild_json = commandsToJSON(commands.guild())

    logger.info({guild: guildId}, "Begin setting guild commands")
    return client.put(
      Routes.applicationGuildCommands(botId, guildId),
      {
        body: guild_json
      }
    )
      .catch((error) => {
        logger.warn(error, `Error setting guild commands for ${guildId}`)
      })
      .finally(() => {
        logger.info({guild: guildId}, "Done setting guild commands")
      })
  },

  async updateGuildCommand(guildId, commandName, commandId) {
    const command_json = commands.guild().get(commandName).data().toJSON()

    logger.info({guild: guildId, command: commandName}, "Begin updating guild command")
    return client.patch(
        Routes.applicationGuildCommand(botId, guildId, commandId),
        {
          body: command_json
        }
      )
      .catch((error) => {
        logger.warn(error, `Error updating guild command ${commandName} for ${guildId}`)
      })
      .finally(() => {
        logger.info({guild: guildId, command: commandName}, "Done updating guild command")
      })
  }
}
