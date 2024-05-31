const api = require("../services/api")

module.exports = {
  name: "guildCreate",
  async execute(discord_guild) {
    const guildFlake = discord_guild.id
    if (
      (process.env.NODE_ENV != "development") ==
      process.env.DEV_GUILDS.includes(guildFlake)
    ) {
      return
    }

    return api.setGuildCommands(guildFlake)
  },
}
