const api = require("../services/api")
const { Collection } = require("discord.js")

api.getGuilds().then((guilds) => {
  guilds.map((guild) => {
    const deployed = api
      .getGuildCommands(guild.id)
      .then((deployed_commands) => deployed_commands.map((c) => c.name))
      .then((command_names) => api.setGuildCommands(guild.id, command_names))
  })
})
