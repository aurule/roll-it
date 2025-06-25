/**
 * Error class to throw when a non-allowed user tries to interact with a component
 */
class UnauthorizedError extends Error {
  interaction
  allowed_uids

  /**
   * Create a new UnauthorizedError
   * @param  {Interaction} interaction  Interaction that triggered the error
   * @param  {Snowflake[]} allowed_uids Array of Discord user IDs that are allowed
   * @return {UnauthorizedError}        New UnauthorizedError object
   */
  constructor(interaction, allowed_uids) {
    super(`User ${interaction.user.id} is not allowed`)
    this.interaction = interaction
    this.allowed_uids = allowed_uids
  }
}

module.exports = {
  UnauthorizedError,
}
