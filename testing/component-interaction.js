const { Interaction } = require("./interaction")

class ComponentInteraction extends Interaction {
  customId
  values

  constructor({ customId, values = [], message, guildId = null, member_flake = null } = {}) {
    super(guildId, member_flake)
    this.customId = customId
    this.values = values
    this.message = message
  }
}

module.exports = {
  ComponentInteraction,
}
