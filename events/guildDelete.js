const { logger } = require("../util/logger")

module.exports = {
  name: "guildDelete",
  execute(guild) {
    logger.info({ id: guild.id, name: guild.name }, `Removed from guild`)
  },
}
