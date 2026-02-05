import 'dotenv/config'

import process from "node:process"
import { logger } from "./util/logger.js"
import { sendError } from "./services/metrics.js"

process.on("unhandledRejection", (error) => {
  sendError(error, { origin: "Unhandled promise rejection" })
  logger.error(error, "Unhandled promise rejection")
})

import { patchDiscord as patchWhisper } from "./patches/whisper.js"
import { patchDiscord as patchEnsure } from "./patches/ensure.js"
import { patchDiscord as patchPaginate } from "./patches/paginate.js"
import { patchDiscord as patchRollReply } from "./patches/roll-reply.js"
import { patchDiscord as patchAuthorize } from "./patches/authorize.js"

patchWhisper()
patchEnsure()
patchPaginate()
patchRollReply()
patchAuthorize()

import {
  Client,
  GatewayIntentBits,
  ActivityType,
  PresenceUpdateStatus,
  Partials,
} from "discord.js"

import { commands } from "./commands/index.js"
import { modals } from "./modals/index.js"
import { register as registerEvents } from "./events/index.js"

import package_data from "../package.json" with { type: "json" }

/**
 * Discord.js client instance
 * @type Client
 */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.User],
  presence: {
    activities: [
      {
        name: `Roll some dice! Or try /help | v${package_data.version}`,
        type: ActivityType.Custom,
      },
    ],
    status: PresenceUpdateStatus.Online,
  },
  failIfNotExists: false,
})

// Store commands (slash commands, context menu commands)
client.commands = commands
// Store modals
client.modals = modals

// Register event listeners
registerEvents(client)

// Login to Discord with the bot's token
client.login(process.env.BOT_TOKEN)
