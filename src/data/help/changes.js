/**
 * Provides data used to show the "changes" help topic
 */

import package_data from "../../../package.json" with { type: "json" }
import current_changes from "../../changes.js"

export function data(locale) {
  const version = package_data.version

  return {
    version,
    changelog: current_changes,
  }
}
