const { Events } = require("discord.js")
const { logger } = require("../util/logger")

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    logger.info({ id: guild.id, name: guild.name }, `Added to guild`)
  },
}
