import { Interaction } from "./interaction.js"

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
