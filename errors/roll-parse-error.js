class RollParseError extends Error {
  constructor(messages) {
    super()
    this.messages = messages
  }

  get message() {
    return this.messages.join("\n")
  }
}

module.exports = {
  RollParseError
}
