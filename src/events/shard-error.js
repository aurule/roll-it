const { Events } = require("discord.js")
const { logger } = require("../util/logger")
const { sendError } = require("../services/metrics")

module.exports = {
  name: Events.ShardError,
  logMe: true,
  logContext(error) {
    return error
  },
  execute(error) {
    sendError(error, { origin: "websocket" })
    logger.error(error, "Websocket error")
  },
}
