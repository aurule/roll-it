const { Events } = require("discord.js")
const { logger } = require("../util/logger")

module.exports = {
  name: Events.GuildDelete,
  execute(guild) {
    logger.info({ id: guild.id, name: guild.name }, `Removed from guild`)
  },
}
