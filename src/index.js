const { performance } = require("node:perf_hooks")
const v8 = require("node:v8")

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

const fs = require("fs")
const { join } = require("node:path")
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  PresenceUpdateStatus,
  Partials,
} = require("discord.js")
const { jsNoTests } = require("./util/filters")
const commands = require("./commands")
const modals = require("./modals")

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
const eventsDir = join(__dirname, "events")
const eventFiles = fs.readdirSync(eventsDir).filter(jsNoTests)
for (const file of eventFiles) {
  const eventFilePath = join(eventsDir, file)
  const event = require(eventFilePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => {
      const context = JSON.stringify(args[0].toJSON(), (key, value) => {
        if (typeof value === "bigint") {
          return value.toString()
        }
        return value
      })

      const timing_data = {
        event: event.name,
        serialized: v8.serialize(args).toString("hex"),
        context,
        began: performance.now(),
        finished: 0,
      }
      try {
        return event.execute(...args)
      } finally {
        timing_data.finished = performance.now()
        logger.debug(timing_data)
        metrics.logTiming(timing_data)
      }
    })
  }
}

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN)
