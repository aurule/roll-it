require("dotenv").config({ quiet: true })

const { logger } = require("./util/logger")
const { metrics } = require("./db/stats")

process.on("unhandledRejection", (error) => {
  logger.error(error, "Unhandled promise rejection")
})

require("./patches/whisper").patch()
require("./patches/ensure").patch()
require("./patches/paginate").patch()
require("./patches/roll-reply").patch()
require("./patches/authorize").patch()

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  PresenceUpdateStatus,
  Partials,
} = require("discord.js")
const commands = require("./commands")
const modals = require("./modals")
const events = require("./events")

const { version } = require("../package.json")

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.User],
  presence: {
    activities: [
      {
        name: `Roll some dice! Or try /help | v${version}`,
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
events.register(client)

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN)
