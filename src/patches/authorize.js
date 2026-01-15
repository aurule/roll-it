/**
 * This patch creates a small helper method named "authorize" on some interaction objects.
 */

import {
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} from "discord.js"

import { UnauthorizedError } from "../errors/unauthorized-error.js"

/**
 * Create the authorize method
 */
export function patch(target_klass) {
  let klasses = [
    ButtonInteraction,
    UserSelectMenuInteraction,
    StringSelectMenuInteraction,
    Message,
  ]
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
    const user = this.user || this.author
    if (allowed_uids.findIndex((v) => v === user.id) < 0) {
      throw new UnauthorizedError(this, allowed_uids)
    }
  }

  for (const klass of klasses) {
    klass.prototype.authorize = authorize
  }
}
