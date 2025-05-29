const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const messagesDir = __dirname

const messages = new Collection()

const contents = fs
  .readdirSync(messagesDir)
  .filter(jsNoTests)
  .filter(noDotFiles)
  .filter((file) => {
    return file !== basename
  })

contents.forEach((message_file) => {
  const message = require(path.join(messagesDir, message_file))
  messages.set(message.state, message)
})

module.exports = commands
