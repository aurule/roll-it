const { Collection } = require("discord.js")

const { Interaction } = require("./interaction")

class ModalFields extends Collection {
  getTextInputValue(name) {
    return this.get(name)
  }

  getStringSelectValues(name) {
    return this.get(name)
  }
}

/**
 * Class to mock a Discord modal interaction
 */
class ModalInteraction extends Interaction {
  customId
  fields = new ModalFields()

  constructor(customId, guildId, member_flake, ...fields) {
    super(guildId, member_flake)
    this.customId = customId
    this.setFields(fields)
  }

  /**
   * Get whether this is a modal.
   *
   * @return {boolean} Always true
   */
  isModal() {
    return true
  }

  /**
   * Set the field values for the modal
   * @param {object} fields Object of new field data
   */
  setFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
      this.fields.set(key, value)
    }
  }

  /**
   * Set the value for a single field
   * @param {string} name  Key of the field to set
   * @param {any}    value Value to save for the field
   */
  setField(name, value) {
    this.fields.set(name, value)
  }
}

module.exports = {
  ModalInteraction,
}
