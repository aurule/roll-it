import progress from "cli-progress"

import { getGuilds, getGuildCommands, setGuildCommands } from "../src/services/api.js"
import { logger } from "../src/util/logger.js"

logger.level = "warn"

const multibar = new progress.MultiBar({
  stopOnComplete: true,
  clearOnComplete: false,
  hideCursor: true,
  format: "{bar} | {id} | {name}",
})

const allBar = multibar.create(1, 0, { name: "All Guilds" }, { format: "{bar} | {name}" })

getGuilds().then((guilds) => {
  allBar.setTotal(guilds.length)
  guilds.map((guild) => {
    const guildBar = multibar.create(4, 1, { name: guild.name, id: guild.id })
    getGuildCommands(guild.id)
      .then((deployed_commands) => {
        guildBar.increment()
        return deployed_commands.map((c) => c.name)
      })
      .then((command_names) => {
        guildBar.increment()
        return setGuildCommands(guild.id, command_names)
      })
      .then(() => guildBar.increment())
      .finally(() => allBar.increment())
  })
})
