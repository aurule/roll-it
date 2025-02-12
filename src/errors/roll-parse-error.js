/**
 * Error class to throw within parser functions
 *
 * Unlike most errors, this expects to receive an array of messages.
 */
class RollParseError extends Error {
  constructor(...messages) {
    super()
    this.messages = messages
  }

  /**
   * Consolidate all messages into a single string
   *
   * @return {str} All of our error messages separated by newlines
   */
  get message() {
    return this.messages.join("\n")
  }
}

module.exports = {
  RollParseError,
}
