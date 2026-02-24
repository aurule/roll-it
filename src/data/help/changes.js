/**
 * Provides data used to show the "changes" help topic
 */

import version from "../../version.js"
import current_changes from "../../changes.js"

export function data(_locale) {
  return {
    version,
    changelog: current_changes,
  }
}
