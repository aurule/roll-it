const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const commandsDir = __dirname

const commands = new Collection()

const contents = fs
  .readdirSync(commandsDir)
  .filter(jsNoTests)
  .filter(noDotFiles)
  .filter((file) => {
    return file !== basename
  })
contents.forEach((command_file) => {
  const command = require(path.join(commandsDir, command_file))
  commands.set(command.name, command)
  command.subcommands?.each((subc) => {
    commands.set(`${command.name} ${subc.name}`, subc)
  })
})

commands.global = function () {
  return this.filter((c) => c.global && !c.parent)
}
commands.guild = function () {
  return this.filter((c) => !(c.global || c.parent))
}
commands.savable = function () {
  return this.filter((c) => !!c.savable)
}

commands.all_choices = commands.map((_cmd, full_name) => ({
  name: full_name,
  value: full_name,
}))

module.exports = commands
