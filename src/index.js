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
import "./commands/chop.js"
import "./commands/coin.js"
import "./commands/curv.js"
import "./commands/d10.js"
import "./commands/d100.js"
import "./commands/d12.js"
import "./commands/d20.js"
import "./commands/d4.js"
import "./commands/d6.js"
import "./commands/d8.js"
import "./commands/dnd.js"
import "./commands/drh.js"
import "./commands/fate.js"
import "./commands/ffrpg.js"
import "./commands/formula.js"
import "./commands/help.js"
import "./commands/kob.js"
import "./commands/8ball.js"
import "./commands/met.js"
import "./commands/nwod.js"
import "./commands/pba.js"
import "./commands/report-this-roll.js"
import "./commands/roll.js"
import "./commands/saved.js"
import "./commands/save-this-roll.js"
import "./commands/setup-roll-it.js"
import "./commands/shadowrun.js"
import "./commands/sra.js"
import "./commands/swn.js"
import "./commands/table.js"
import "./commands/wod20.js"

import { commands } from "./commands/index.js"
client.commands = commands

// Store modals
import { modals } from "./modals/index.js"
client.modals = modals

// Register event listeners
import { register as registerEvents } from "./events/index.js"
registerEvents(client)

// Login to Discord with the bot's token
client.login(process.env.BOT_TOKEN)
