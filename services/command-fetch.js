"use strict"

const { jsNoTests, noDotFiles } = require("../util/filters")

const fs = require("fs")
const path = require("path")
const basename = path.basename(__filename)

const commandsDir = `${__dirname}/../commands`

function getCommands(target_dir) {
  const commands = []

  fs.readdirSync(target_dir)
    .filter(jsNoTests)
    .filter(noDotFiles)
    .forEach((file) => {
      const command = require(path.join(target_dir, file))
      commands.push(command)
    })

  return commands
}

function all() {
  return getCommands(commandsDir)
}

function global() {
  return all().filter(c => c.global ?? false)
}

function guild() {
  return all().filter(c => !(c.global ?? false))
}

module.exports = {
  getCommands,
  all,
  global,
  guild
}
