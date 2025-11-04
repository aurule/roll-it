const { Events } = require("discord.js")
const { logger } = require("../util/logger")
const { envAllowsGuild } = require("../util/env-allows-guild")
const Mentions = require("../mentions")

module.exports = {
  name: Events.MessageCreate,
  logMe: false,
  logContext(_args) {
    return {}
  },
  async execute(message) {
    if (!message.mentions.users.has(process.env.CLIENT_ID))
      return Promise.resolve("does not mention bot")
    if (!envAllowsGuild(message.guildId)) return Promise.resolve("wrong guild for env")

    return Mentions.handle(message)
  },
}
