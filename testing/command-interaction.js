const { Interaction } = require("./interaction")

class CommandInteraction extends Interaction {
  commandName
  command_options

  constructor({commandName, options = {}, guildId = null, member_flake = null} = {}) {
    super(guildId, member_flake)
    this.commandName = commandName
    Object.assign(this.command_options, options)
  }

  isCommand() {
    return true
  }
}

module.exports = {
  CommandInteraction,
}
