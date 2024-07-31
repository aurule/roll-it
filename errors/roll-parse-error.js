class RollParseError extends Error {
  constructor(messages) {
    this.messages = messages
  }

  get message() {
    return this.messages.join("\n")
  }
}

module.exports = {
  RollParseError
}
