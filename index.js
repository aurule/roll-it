// Load envvars
require("dotenv").config()

// Require the necessary discord.js classes
const fs = require("fs")
const { Client, GatewayIntentBits } = require("discord.js")
const { jsNoTests } = require("./util/filters")
const commands = require("./commands")

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
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
