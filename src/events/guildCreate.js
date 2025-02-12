const { Events } = require("discord.js")
const { logger } = require("../util/logger")

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    logger.info({ id: guild.id, name: guild.name }, `Added to guild`)

    if ((process.env.NODE_ENV != "development") == process.env.DEV_GUILDS.includes(guild.id)) {
      return
    }
  },
}
