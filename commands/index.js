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
})

commands.global = function () {
  return this.filter((c) => c.global)
}
commands.guild = function () {
  return this.filter((c) => !c.global)
}

commands.all_choices = []
commands.each((cmd, _k) => {
    commands.all_choices.push({
      name: cmd.name,
      value: cmd.name
    })

    cmd.subcommands?.each((subc, _sk) => {
      commands.all_choices.push({
        name: `${cmd.name} ${subc.name}`,
        value: `${cmd.name} ${subc.name}`
      })
    })
  })

commands.surface_choices = commands.map(cmd => {
  return {
    name: `${cmd.name}`,
    value: `${cmd.name}`
  }
})

module.exports = commands
