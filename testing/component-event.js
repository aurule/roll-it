class ComponentEvent {
  constructor(customId) {
    this.customId = customId
  }

  async deferUpdate() {
    return Promise.resolve()
  }
}

module.exports = {
  ComponentEvent,
}
