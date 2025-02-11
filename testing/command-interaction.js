const { Interaction } = require("./interaction")

class CommandInteraction extends Interaction {
  commandName
  command_options = {}

  constructor(commandName, guildId, member_flake, ...options) {
    super(guildId, member_flake)
    this.commandName = commandName
    this.setOptions(options)
  }

  isCommand() {
    return true
  }

  setOptions(options) {
    Object.assign(this.command_options, options)
  }

  setOption(name, value) {
    this.command_options.name = value
  }
}

module.exports = {
  CommandInteraction,
}
