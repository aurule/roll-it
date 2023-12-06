"use strict"

require("dotenv").config()

const { logger } = require("../util/logger")
const { REST, Routes } = require("discord.js")

const commandFetch = require("./command-fetch")

const clientId = process.env.CLIENT_ID

/**
 * Helper to create a REST instance
 * @return {REST} REST client instance
 */
function restClient() {
  const token = process.env.BOT_TOKEN
  return new REST().setToken(token)
}

/**
 * Build the global command json to send to Discord
 * @return {string} JSON data about our global slash commands
 */
function buildGlobalCommandJSON() {
  return commandFetch.global().map(c => c.data().toJSON())
}

/**
 * Build a guild's command json to send to Discord
 *
 * @param  {Array[str]}  command_names  Optional list of guild command names
 * @return {string}                     JSON data about the guild's commands
 */
function buildGuildCommandJSON(command_names = null) {
  let guild_commands = commandFetch.guild()
  if(command_names !== null) {
    guild_commands = guild_commands.filter(c => command_names.includes(c.name))
  }
  return guild_commands.map(c => c.data().toJSON())
}

/**
 * Generate a unique hash for the global command JSON structure
 * @return {string} Hash of the JSON data about global slash commands
 */
function hashGlobalCommandJSON() {
  // Quick hash function courtesy of https://stackoverflow.com/users/815680/bryc found
  // at https://stackoverflow.com/a/52171480
  const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return (h2>>>0).toString(16).padStart(8,0)+(h1>>>0).toString(16).padStart(8,0);
  };

  // use fn from module.exports so we can mock it out in tests
  return cyrb53(JSON.stringify(module.exports.buildGlobalCommandJSON()))
}

/**
 * Push the global command JSON
 *
 * If given a hash, no deploy will happen if that hash matches the hash of our current command json.
 *
 * @param  {string}   hash  Optional hash of old command json
 * @return {Promise}        Promise for the http call
 */
async function deployGlobals(hash = null) {
  if(hash) {
    const newHash = module.exports.hashGlobalCommandJSON()
    if (hash === newHash) {
      logger.info("Global commands have not changed, skipping deploy")
      return
    }
  }

  logger.info("Deploying global commands")

  return restClient()
    .put(Routes.applicationCommands(clientId), {
      body: buildGlobalCommandJSON(),
    })
    .catch((error) => {
      logger.warn(`Error deploying global commands: ${error}`)
    })
    .finally(() => {
      logger.info("Done with globals")
    })
}

/**
 * Push a guild's command JSON
 *
 * Without command_names, this will push all available guild commands. With
 * command_names, only the listed commands will be pushed.
 *
 * @param  {string}     guildFlake    Snowflake ID of the guild
 * @param  {Array[str]} command_names Array of command names
 * @return {string}                   Promise for the http call
 */
async function deployGuild(guildFlake, command_names = null) {
  logger.info(`Deploying commands to guild ${guildFlake}`)

  return restClient()
    .put(Routes.applicationGuildCommands(clientId, guildFlake), {
      body: buildGuildCommandJSON(command_names),
    })
    .catch((error) => {
      logger.warn(`Error deploying guild commands to ${guildFlake}: ${error}`)
    })
    .finally(() => {
      logger.info(`Done with guild ${guildFlake}`)
    })
}

/**
 * Build global commands as though they're guild commands and push to the dev servers
 * @return {Promise}      Promise for the http call
 */
async function deployDev() {
  const devFlakes = JSON.parse(process.env.DEV_GUILDS)

  logger.info("Deploying global commands as guild commands to dev servers")

  const commandJSON = buildGlobalCommandJSON()

  return Promise
    .all(devFlakes.map(guildFlake => restClient()
      .put(Routes.applicationGuildCommands(clientId, guildFlake), {
        body: commandJSON,
      })
      .catch((error) => {
        logger.warn(`Error deploying commands to guild ${guildFlake}: ${error}`)
      })
      .finally(() => {
        logger.info(`Deployed to guild ${guildFlake}`)
      })))
    .finally(() => {
      logger.info("Done with dev guilds")
    })
}

module.exports = {
  buildGlobalCommandJSON,
  buildGuildCommandJSON,
  hashGlobalCommandJSON,
  restClient,
  deployGlobals,
  deployDev,
  deployGuild,
}
