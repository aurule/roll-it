/**
 * Provides data used to show the "changes" help topic
 */

const fs = require("fs")
const path = require("path")

const { version } = require("../../../package.json")
const { i18n } = require("../../locales")

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
function getChangelog(changelog_version, locale) {
  try {
    return fs.readFileSync(path.join(__dirname, "../../../changelog", `${changelog_version}.md`))
  } catch {
    return i18n.t("changes.missing", { ns: "help", lng: locale, version: changelog_version })
  }
}

module.exports = {
  name: "changes",
  help_data(locale) {
    return {
      version,
      changelog: getChangelog(version, locale),
    }
  },
  getChangelog,
}
