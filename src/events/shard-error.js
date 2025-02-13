const { Events } = require("discord.js")
const { logger } = require("../util/logger")

module.exports = {
  name: Events.ShardError,
  execute(error) {
    logger.error(error, "Websocket error")
  },
}
