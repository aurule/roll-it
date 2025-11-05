const fs = require("fs")
const path = require("path")
const { Collection } = require("@discordjs/collection")
const { available_locales } = require("../locales")
const { comparator } = require("../util/command-sorter")

const { jsNoTests } = require("../util/filters")

const basename = path.basename(__filename)
const commandsDir = __dirname

/**
 * Top-level collection of command objects
 *
 * Various keys are reserved for grouping commands. Otherwise, keys match the name of the bot's commands.
 *
 * @type {Collection}
 */
const commands = new Collection()

commands.global = new Collection()
commands.guild = new Collection()
commands.deployable = new Collection()
commands.savable = new Collection()
commands.all_choices = []
commands.deprecated = new Collection()
commands.teamworkable = new Collection()

commands.sorted = new Collection()
commands.sorted.guild = new Collection()
commands.sorted.global = new Collection()
commands.sorted.savable = new Collection()
commands.sorted.teamworkable = new Collection()

const contents = fs
  .readdirSync(commandsDir)
  .filter(jsNoTests)
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
  if (command.teamwork) commands.teamworkable.set(command.name, command)
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

for (const locale of available_locales) {
  commands.sorted.set(locale, commands.toSorted(comparator(locale)))
  commands.sorted.guild.set(locale, commands.guild.toSorted(comparator(locale)))
  commands.sorted.global.set(locale, commands.global.toSorted(comparator(locale)))
  commands.sorted.savable.set(locale, commands.savable.toSorted(comparator(locale)))
  commands.sorted.teamworkable.set(locale, commands.teamworkable.toSorted(comparator(locale)))
}

module.exports = commands
