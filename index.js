// Load envvars
require("dotenv").config()

require("./patches/whisper").patch()
require("./patches/paginate").patch()

const { version } = require("./package.json")

// Require the necessary packages
const fs = require("fs")
const { Client, GatewayIntentBits, ActivityType } = require("discord.js")
const { jsNoTests } = require("./util/filters")
const commands = require("./commands")

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
const eventFiles = fs.readdirSync("./events").filter(jsNoTests)
for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

// Login to Discord with your client's token
client.login(token)
