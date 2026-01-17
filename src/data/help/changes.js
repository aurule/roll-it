/**
 * Provides data used to show the "changes" help topic
 */

import fs from "node:fs"
import path from "node:path"

import package_data from "../package.json" with { type: "json" }
import { i18n } from "../../locales/index.js"

/**
 * Read the changelog file for a given version
 *
 * This looks in the root `/changelog` folder for files. If no file matches the given version, a translated
 * string is returned instead.
 *
 * @param  {str} changelog_version Roll It version string
 * @param  {str} locale            Locale key for the missing changelog string
 * @return {Buffer|str}            Changelog text or missing changelog string
 */
export function getChangelog(changelog_version, locale) {
  try {
    return fs.readFileSync(path.join(__dirname, "../../../changelog", `${changelog_version}.md`))
  } catch {
    return i18n.t("changes.missing", { ns: "help", lng: locale, version: changelog_version })
  }
}

export function data(locale) {
  const version = package_data.version

  return {
    version,
    changelog: getChangelog(version, locale)
  }
}
