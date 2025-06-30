/**
 * This patch creates a small helper method named "authorize" on some interaction objects.
 */

const {
  MessageFlags,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
} = require("discord.js")

const { UnauthorizedError } = require("../errors/unauthorized-error")

module.exports = {
  /**
   * Create the authorize method
   */
  patch(target_klass) {
    let klasses = [ButtonInteraction, UserSelectMenuInteraction, StringSelectMenuInteraction]
    if (target_klass) {
      klasses = [target_klass]
    }

    /**
     * Allow users with the given discord uids to continue
     *
     * @throws UnauthorizedError if user uid is not in the array
     *
     * @param  {...Snowflake} allowed_uids Array of allowed user snowflakes
     */
    const authorize = function (...allowed_uids) {
      if (allowed_uids.findIndex((v) => v === this.user.id) < 0) {
        throw new UnauthorizedError(this, allowed_uids)
      }
    }

    for (const klass of klasses) {
      klass.prototype.authorize = authorize
    }
  },
}
