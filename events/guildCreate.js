const commandService = require("../services/command-deploy");

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

    await commandService.deployGuild(guildFlake)
  },
}
