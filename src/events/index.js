import { Events } from "discord.js"
import { logger } from "../util/logger.js"
import { mentionDispatch } from "../mentions/index.js"
import { sendError } from "../services/metrics"

import { handleInteractionCreated } from "./interactionCreate.js"

export function register(client) {
  client.once(Events.ClientReady, (client) => {
    logger.info(
      {
        event: module.exports.name,
        tag: client.user.tag,
      },
      `Ready! Logged in as ${client.user.tag}`,
    )
  })

  client.on(Events.GuildCreate, (guild) => {
    logger.info({ id: guild.id, name: guild.name }, `Added to guild`)
  })

  client.on(Events.GuildDelete, (guild) => {
    logger.info({ id: guild.id, name: guild.name }, `Removed from guild`)
  })

  client.on(Events.MessageCreate, (message) => {
    if (!message.mentions.users.has(process.env.CLIENT_ID))
      return Promise.resolve("does not mention bot")
    if (!envAllowsGuild(message.guildId)) return Promise.resolve("wrong guild for env")

    return mentionDispatch(message)
  })

  client.on(Events.ShardError, (error) => {
    sendError(error, { origin: "websocket" })
    logger.error(error, "Websocket error")
  })

  client.on(Events.InteractionCreate, handleInteractionCreated)
}
