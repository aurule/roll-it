const { italic, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const { logger } = require("../util/logger")

function guildAnnouncementChannel(guild) {
  return guild.channels.cache.find(
    (channel) =>
      channel.type === "GUILD_TEXT" && channel.permissionsFor(guild.me).has("SEND_MESSAGES"),
  )
}

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    logger.info({ id: guild.id, name: guild.name }, `Added to guild`)

    if ((process.env.NODE_ENV != "development") == process.env.DEV_GUILDS.includes(guild.id)) {
      return
    }
  },
}
