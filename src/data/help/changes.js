/**
 * Provides data used to show the "changes" help topic
 */

import version from "../../version.js"
import current_changes from "../../changes.js"

/**
 * Get the version and current changelog message for Roll It
 * @param  {string}    _locale  Locale for translations
 * @param  {Snowflake} _guildId ID of the requesting user's guild
 * @return {object}             Object with version and changes info
 */
export function data(_locale, _guildId) {
  return {
    version,
    changelog: current_changes,
  }
}
