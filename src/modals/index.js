const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const modalsDir = __dirname

const modals = new Collection()

const contents = fs
  .readdirSync(modalsDir)
  .filter(jsNoTests)
  .filter(noDotFiles)
  .filter((file) => {
    return file !== basename
  })
contents.forEach((command_file) => {
  const modal = require(path.join(modalsDir, command_file))
  modals.set(modal.name, modal)
})

module.exports = modals
