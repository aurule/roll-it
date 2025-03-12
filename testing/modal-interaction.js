const { Collection } = require("discord.js")

const { Interaction } = require("./interaction")

class ModalFields extends Collection {
  getTextInputValue(name) {
    return this.get(name)
  }
}

class ModalInteraction extends Interaction {
  customId
  fields = new ModalFields()

  constructor(customId, guildId, member_flake, ...fields) {
    super(guildId, member_flake)
    this.customId = customId
    this.setFields(fields)
  }

  isModal() {
    return true
  }

  setFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
      this.fields.set(key, value)
    }
  }

  setField(name, value) {
    this.fields.set(name, value)
  }
}

module.exports = {
  ModalInteraction,
}
