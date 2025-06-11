/**
 * Error class to throw when a non-allowed user tries to interact with a component
 */
class UnauthorizedError extends Error {
  interaction

  constructor(interaction) {
    super(`User ${interaction.user.id} is not allowed`)
    this.interaction = interaction
  }
}

module.exports = {
  UnauthorizedError,
}
