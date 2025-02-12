require("dotenv").config()

const { logger } = require("./util/logger")

process.on('unhandledRejection', error => {
  logger.error(error, 'Unhandled promise rejection')
})

require("./patches/whisper").patch()
require("./patches/paginate").patch()
require("./patches/roll-reply").patch()

const fs = require("fs")
const { join } = require("node:path")
const { Client, GatewayIntentBits, ActivityType } = require("discord.js")
const { jsNoTests } = require("./util/filters")
const commands = require("./commands")

const { version } = require("../package.json")

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    activities: [
      {
        name: `Roll some dice! Or try /help | v${version}`,
        type: ActivityType.Custom,
      },
    ],
  },
})
const token = process.env.BOT_TOKEN

// Store commands (slash commands, context menu commands)
client.commands = commands

// Register event listeners
const eventsDir = join(__dirname, "events")
const eventFiles = fs.readdirSync(eventsDir).filter(jsNoTests)
for (const file of eventFiles) {
  const eventFilePath = join(eventsDir, file)
  const event = require(eventFilePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

// Login to Discord with your client's token
client.login(token)
