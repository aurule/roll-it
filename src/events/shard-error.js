const { Events } = require("discord.js")
const { logger } = require("../util/logger")

module.exports = {
  name: Events.ShardError,
  logMe: true,
  logContext(error) {
    return error
  },
  execute(error) {
    logger.error(error, "Websocket error")
  },
}
