module.exports = {
  name: "guildCreate",
  async execute(discord_guild) {
    if (
      (process.env.NODE_ENV != "development") ==
      process.env.DEV_GUILDS.includes(discord_guild.id)
    ) {
      return
    }
  },
}
