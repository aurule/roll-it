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

    const channel = guildAnnouncementChannel(guild)
    try {
      channel.send(
        [
          oneLine`
          You've added Roll It! It's full of dice. ${italic("So many dice.")} Admins, please use the
          ${inlineCode("/roll-chooser")} command to set which dice rollers are availble on this server. You can
          use ${inlineCode("/help topic:Dice Systems")} to see what Roll It supports if you aren't sure what
          will suit your needs. If you want to know more about a command, use ${inlineCode("/help command")} to
          read up on it.`,
          "",
          `Have fun! Now go roll some dice!`,
        ].join("\n"),
      )
    } catch(error) {
      // this is not a critical message, so just log that we couldn't send it
      logger.warn(error, "Could not send welcome message")
    }
  },
}
