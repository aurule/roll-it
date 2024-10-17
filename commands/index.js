const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const commandsDir = __dirname

const commands = new Collection()

commands.global = new Collection()
commands.guild = new Collection()
commands.deployable = new Collection()
commands.savable = new Collection()
commands.all_choices = []
commands.deprecated = new Collection()

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
  commands.all_choices.push({
    name: command.name,
    value: command.name,
  })

  command.subcommands?.each((subc) => {
    commands.set(`${command.name} ${subc.name}`, subc)
    commands.all_choices.push({
      name: `${command.name} ${subc.name}`,
      value: `${command.name} ${subc.name}`,
    })
  })

  // subcommands never appear in these collections
  if (command.savable) commands.savable.set(command.name, command)
  if (command.global) {
    commands.global.set(command.name, command)
  } else {
    commands.guild.set(command.name, command)
    if (!command.hidden) {
      if (command.replacement) commands.deprecated.set(command.name, command)
      else commands.deployable.set(command.name, command)
    }
  }
})

module.exports = commands
