const { Events } = require("discord.js")
const { logger } = require("../util/logger")

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(
      {
        event: module.exports.name,
        tag: client.user.tag,
      },
      `Ready! Logged in as ${client.user.tag}`,
    )
  },
}
